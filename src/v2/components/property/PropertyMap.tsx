import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import marker from '../../../assets/property/location/epiisod-marker.svg';
import pointer from '../../../assets/property/location/card-pointer.svg';
import placeholderPin from '../../../assets/property/location/icon-map-pin-placeholder.svg';
import type { MapPlace } from './propertyContent';
import './PropertyMap.css';

/**
 * Map tiles: OpenStreetMap's standard tiles, in their usual colours, which need no API
 * key. OSM's tile servers are for light use only — for
 * production traffic, swap this for a tile provider with a key (e.g. MapTiler or
 * Stadia Maps) or Google Maps with EPIISOD's own key, as on the live site.
 */
const TILES = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
/** Zoom with no area chosen: the property among its neighbouring suburbs (Figma 1080:5903). */
const HOME_ZOOM = 14;
/** v2: how close the map zooms in on a marker when it's clicked. */
const MARKER_ZOOM = 16;
/** Roughly how far (px) a details card reaches above its marker, so the zoom leaves room. */
const CARD_LIFT = 150;

/**
 * Leaflet's wheel zoom, for trackpad pinches only (ctrl + wheel). Plain wheel events are
 * left alone, so they scroll the page.
 */
// Leaflet's typings don't declare the handler class, though it's there at runtime
const WheelZoom = (L.Map as unknown as {
  ScrollWheelZoom: typeof L.Handler & { prototype: { _onWheelScroll: (e: WheelEvent) => void } };
}).ScrollWheelZoom;
const PinchZoom = WheelZoom.extend({
  _onWheelScroll(this: unknown, e: WheelEvent) {
    if (!e.ctrlKey) return;
    WheelZoom.prototype._onWheelScroll.call(this, e);
  },
});

/** A numbered place on the map. */
export type MapMarker = { id: string; label: string; place: MapPlace };

type PropertyMapProps = {
  /** The property's name, before and after the italic part ("EPIISOD" + "Macquarie Park"). */
  brand: string;
  place: string;
  address: string;
  center: { lat: number; lng: number };
  /** The places to show, numbered. */
  markers: MapMarker[];
  /** Changing this re-frames the map around the markers (or back on the property). */
  frame: string | null;
  /** Room (px) the finder takes over the map's top-left corner (or its foot, `bottom`, on
   *  the full-screen phone map), kept clear when framing. */
  inset: Inset;
  /** The same while a photo is open, when the panel can be taller. */
  spotlightInset: Inset;
  /** Full screen on a phone: one finger moves the map (there's no page to scroll). */
  full?: boolean;
  /** The place under the pointer in the list, lit on the map. */
  highlight: string | null;
  /** The place picked in the list: the map moves to it and opens its card. */
  focus: { id: string } | null;
  /** The place whose photo is open in the finder: lit, and framed a little closer with the property. */
  spotlight: string | null;
  /** The property's photo, shown in its card when the EPIISOD marker is clicked (v2). */
  photo?: string;
  onMarkerClick: (id: string) => void;
};

type Inset = { left: number; top: number; bottom?: number };

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** v2: a place's details card — its photo (or a placeholder), name and address. */
const popupHtml = (title: string, address: string, image?: string) =>
  (image
    ? `<img class="map-popup__photo" src="${image}" alt="" />`
    : `<div class="map-popup__photo map-popup__photo--none"><img src="${placeholderPin}" width="32" height="32" alt="" /></div>`) +
  `<div class="map-popup__body"><p class="map-popup__title">${escape(title)}</p><p class="map-popup__address">${escape(address)}</p></div>`;

/**
 * Neighbourhood map (Figma 1080:5903 / 1182:8433): the EPIISOD marker under the property's
 * card, and numbered markers for the places in the chosen area. Drag to move; zoom with
 * the buttons, pinch or double-click (the wheel scrolls the page).
 */
export default function PropertyMap({
  brand,
  place,
  address,
  center,
  markers,
  frame,
  inset,
  spotlightInset,
  highlight,
  focus,
  spotlight,
  photo,
  onMarkerClick,
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const clickRef = useRef(onMarkerClick);
  clickRef.current = onMarkerClick;
  const insetRef = useRef(inset);
  insetRef.current = inset;

  /**
   * v2: zoom in on a point, leaving it a little below and to the right of the map's middle
   * so the card that opens above it sits clear of the finder in the corner. Calls `then`
   * once the map has settled there.
   */
  const zoomTo = (latlng: L.LatLng, then: () => void) => {
    const map = mapRef.current;
    if (!map) return;
    const clear = insetRef.current;
    // Already zoomed in: the map stays put while the point and its card fit in view (no
    // movement at all), or slides straight there at the same zoom (never zooming out and
    // back in, which is what Leaflet's fly does)
    if (map.getZoom() >= MARKER_ZOOM) {
      const pt = map.latLngToContainerPoint(latlng);
      const size = map.getSize();
      const fits =
        pt.x > (clear.left || 0) + 160 &&
        pt.x < size.x - 160 &&
        pt.y > CARD_LIFT + 120 &&
        pt.y < size.y - 40 - (clear.bottom ?? 0);
      if (fits) {
        then();
        return;
      }
      const zoom = map.getZoom();
      const offset = L.point(-(clear.left || 0) / 2, -CARD_LIFT / 2 + (clear.bottom ? clear.bottom / 2 : 0));
      map.once('moveend', then);
      map.panTo(map.unproject(map.project(latlng, zoom).add(offset), zoom), { duration: 0.6, easeLinearity: 0.3 });
      return;
    }
    const zoom = MARKER_ZOOM;
    const offset = L.point(-(clear.left || 0) / 2, -CARD_LIFT / 2 + (clear.bottom ? clear.bottom / 2 : 0));
    const target = map.unproject(map.project(latlng, zoom).add(offset), zoom);
    map.once('moveend', then);
    map.flyTo(target, zoom, { duration: 0.9, easeLinearity: 0.2 });
  };
  const zoomRef = useRef(zoomTo);
  zoomRef.current = zoomTo;

  // The map and the property's marker, once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = L.map(container, {
      center: [center.lat, center.lng],
      zoom: HOME_ZOOM,
      zoomControl: false,
      // The page scrolls with the wheel; zoom with the buttons, a pinch (touch or
      // trackpad, handled below) or double-click
      scrollWheelZoom: false,
      // v2: drag to pan everywhere — mouse, and one finger on touch screens
      dragging: true,
      // Pinching zooms in quarter steps; the buttons a whole level
      zoomSnap: 0.25,
      zoomDelta: 1,
      // Pinch zoom (below): how much pinching makes one zoom level, and how long a pinch is
      // gathered before the map zooms
      wheelPxPerZoomLevel: 40,
      wheelDebounceTime: 30,
    });

    // v2: trackpad pinch to zoom around the pointer, with Leaflet's own wheel-zoom handler
    // (it gathers the pinch for a moment, then makes one animated zoom — no flicker), but
    // only for pinches: Chrome and Firefox report a pinch as ctrl + wheel. A plain wheel
    // still scrolls the page.
    map.addHandler('pinchZoom', PinchZoom);
    (map as L.Map & { pinchZoom: L.Handler }).pinchZoom.enable();

    // Safari reports a pinch as gesture events: follow it with one animated zoom at a time
    let gestureStart = 0;
    let gestureTarget = 0;
    let gesturePoint = L.point(0, 0);
    let gestureFrame = 0;
    type GestureEvt = Event & { scale: number; clientX: number; clientY: number };
    const clampZoom = (z: number) => Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), z));
    const applyGesture = () => {
      gestureFrame = 0;
      if (Math.abs(gestureTarget - map.getZoom()) < 0.05) return;
      map.setZoomAround(gesturePoint, gestureTarget, { animate: true });
    };
    const onGestureStart = (e: Event) => {
      e.preventDefault();
      gestureStart = map.getZoom();
    };
    const onGestureChange = (e: Event) => {
      const g = e as GestureEvt;
      e.preventDefault();
      const r = container.getBoundingClientRect();
      gesturePoint = L.point(g.clientX - r.left, g.clientY - r.top);
      gestureTarget = clampZoom(gestureStart + Math.log2(g.scale));
      if (!gestureFrame) gestureFrame = window.setTimeout(applyGesture, 90);
    };
    container.addEventListener('gesturestart', onGestureStart);
    container.addEventListener('gesturechange', onGestureChange);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer(TILES.url, { attribution: TILES.attribution, maxZoom: 19 }).addTo(map);

    // The EPIISOD marker with the property's card above it, always shown. The icon is a
    // point at the marker's centre; the card and marker are placed around it in CSS.
    L.marker([center.lat, center.lng], {
      title: `${brand} ${place}`,
      keyboard: false,
      // Under the numbered markers, so places right next door stay visible
      zIndexOffset: -1000,
      icon: L.divIcon({
        className: 'map-home',
        iconSize: [0, 0],
        html: `
          <div class="map-home__card">
            ${photo ? `<img class="map-home__photo" src="${photo}" alt="" />` : ''}
            <p class="map-home__name">${escape(brand)} <em>${escape(place)}</em></p>
            <p class="map-home__address">${escape(address)}</p>
            <img class="map-home__pointer" src="${pointer}" width="23" height="17" alt="" />
          </div>
          <img class="map-home__mark" src="${marker}" width="140" height="190.5" alt="" />`,
      }),
    })
      // v2: clicking the EPIISOD marker zooms in on the property and opens its photo
      .on('click', (e) => {
        map.closePopup();
        zoomRef.current(e.latlng ?? L.latLng(center.lat, center.lng), () => container.classList.add('home-open'));
      })
      .addTo(map);
    // Clicking the map itself puts the property's card back to its small size
    map.on('click', () => container.classList.remove('home-open'));

    layerRef.current = L.layerGroup().addTo(map);
    // A place's card replaces the property's while it's open
    map.on('popupopen', () => {
      container.classList.add('has-popup');
      container.classList.remove('home-open');
    });
    map.on('popupclose', () => container.classList.remove('has-popup'));
    mapRef.current = map;
    // Leaflet measures its box once; re-measure if the layout around it changes
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => {
      ro.disconnect();
      window.clearTimeout(gestureFrame);
      container.removeEventListener('gesturestart', onGestureStart);
      container.removeEventListener('gesturechange', onGestureChange);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current.clear();
    };
  }, [brand, place, address, center, photo]);

  // The chosen area's numbered markers
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    markersRef.current.clear();
    markers.forEach(({ id, label, place: p }) => {
      const m = L.marker([p.lat, p.lng], {
        title: p.name,
        icon: L.divIcon({
          className: 'map-marker',
          html: `<span>${label}</span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        }),
      })
        .bindPopup(popupHtml(p.name, p.address, p.image), {
          className: 'map-popup',
          autoPanPaddingTopLeft: [inset.left + 16, inset.top + 16],
          autoPanPaddingBottomRight: [24, (inset.bottom ?? 0) + 24],
          maxWidth: 260,
          minWidth: 260,
        });
      // v2: a click zooms in on the place first, then opens its card (instead of Leaflet's
      // own open-on-click, which would open it before the map has moved)
      m.off('click');
      m.on('click', () => {
        clickRef.current(id);
        m.closePopup();
        zoomRef.current(m.getLatLng(), () => m.openPopup());
      }).addTo(layer);
      markersRef.current.set(id, m);
    });
  }, [markers, inset]);

  // Frame the area (keeping the property in view, and clear of the finder panel), or
  // go back to the property when the area is cleared. A spotlit place is framed on its
  // own with the property: closer in, both still in view.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.closePopup();
    // Choosing (or clearing) an area puts the property's card back to its small size
    containerRef.current?.classList.remove('home-open');
    if (frame === null) {
      map.flyTo([center.lat, center.lng], HOME_ZOOM, { duration: 0.8 });
      return;
    }
    const lit = spotlight ? markers.filter((m) => m.id === spotlight) : [];
    const shown = lit.length ? lit : markers;
    const points = [L.latLng(center.lat, center.lng), ...shown.map((m) => L.latLng(m.place.lat, m.place.lng))];
    const clear = lit.length ? spotlightInset : inset;
    map.flyToBounds(L.latLngBounds(points), {
      paddingTopLeft: [clear.left + 32, Math.max(clear.top, 150)],
      paddingBottomRight: [56, Math.max(48, (clear.bottom ?? 0) + 24)],
      maxZoom: 16,
      duration: 0.8,
    });
    // A spotlit place shows its details once the map settles, where it was framed
    const m = lit.length ? markersRef.current.get(lit[0].id) : undefined;
    if (!m) return;
    const show = () => {
      const popup = m.getPopup();
      if (!popup) return;
      popup.options.autoPan = false;
      m.openPopup();
      popup.options.autoPan = true;
    };
    map.once('moveend', show);
    return () => {
      map.off('moveend', show);
    };
    // Only when the area or spotlight changes, not when the marker list is rebuilt with it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, spotlight, center]);

  // Light the place under the pointer in the list
  useEffect(() => {
    markersRef.current.forEach((m, id) => {
      m.getElement()?.classList.toggle('is-lit', id === highlight);
      m.setZIndexOffset(id === highlight ? 900 : 0);
    });
  }, [highlight, markers]);

  // Move to the place picked in the list and open its card
  useEffect(() => {
    const map = mapRef.current;
    const m = focus && markersRef.current.get(focus.id);
    if (!map || !m) return;
    map.panInside(m.getLatLng(), {
      paddingTopLeft: [inset.left + 40, 160],
      paddingBottomRight: [60, Math.max(60, (inset.bottom ?? 0) + 40)],
    });
    m.openPopup();
  }, [focus, inset]);

  return (
    <div
      ref={containerRef}
      className="property-map"
      role="region"
      aria-label={`Map of places near ${brand} ${place}`}
    />
  );
}
