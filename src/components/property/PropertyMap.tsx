import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-leaflet';
import marker from '../../assets/property/location/epiisod-marker.svg';
import pointer from '../../assets/property/location/card-pointer.svg';
import type { MapPlace } from './propertyContent';
import './PropertyMap.css';

/**
 * Basemap: OpenFreeMap's vector styles (OpenStreetMap data, drawn with MapLibre), which need
 * no API key. Liberty on light; Positron, darkened with CSS, on dark. For heavy production
 * traffic, self-host the tiles or use a provider with a key (MapTiler, Stadia Maps, Google Maps).
 */
const STYLES = { light: 'https://tiles.openfreemap.org/styles/liberty', dark: 'https://tiles.openfreemap.org/styles/positron' };
const ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';
const isDark = () => document.documentElement.dataset.theme === 'dark';
/** Zoom before any place is framed: the property among its neighbouring suburbs. */
const HOME_ZOOM = 14;
/** Below this zoom, places close together on screen gather into one numbered cluster. */
const CLUSTER_BELOW = 16;
/** Clusters gather places within this many pixels (a grid cell) of each other. */
const CLUSTER_CELL = 48;

/** A place on the map, with its category (name and icon) and its distance from the property. */
export type MapMarker = { id: string; place: MapPlace; category: string; icon: string; distance: string };

type Inset = { left: number; top: number; bottom?: number };

type PropertyMapProps = {
  /** The property's name, before and after the italic part ("EPIISOD" + "Macquarie Park"). */
  brand: string;
  place: string;
  address: string;
  center: { lat: number; lng: number };
  /** The places to show. */
  markers: MapMarker[];
  /** Changing this re-frames the map around `framePoints` (with the property). */
  frameKey: string;
  framePoints: { lat: number; lng: number }[];
  /** Room (px) the list and filters take over the map (top-left corner, or foot on the
   *  full-screen phone map), kept clear when framing. */
  inset: Inset;
  /** Full screen on a phone: one finger moves the map (there's no page to scroll). */
  full?: boolean;
  /** The place under the pointer in the list (or the chosen one), lit on the map. */
  highlight: string | null;
  /** A place picked in the list: the map moves to it and opens its card. `n` repeats a pick. */
  focus: { id: string; n: number } | null;
  onMarkerClick: (id: string) => void;
};

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const popupHtml = (m: MapMarker) => `
  ${m.place.image ? `<img class="map-popup__photo" src="${escape(m.place.image)}" alt="" />` : ''}
  <p class="map-popup__kind">${escape(m.category)} · ${escape(m.distance)}</p>
  <p class="map-popup__title">${escape(m.place.name)}</p>
  <p class="map-popup__address">${escape(m.place.address)}</p>
  <a class="map-popup__link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/dir/?api=1&destination=${m.place.lat},${m.place.lng}">Directions</a>`;

/**
 * Neighbourhood map (Figma 1080:5903 / 1182:8433): the EPIISOD marker under the property's
 * card, and a marker for each place in the finder, with the category's icon on it. Places
 * close together gather into numbered clusters until zoomed in. Drag to move; zoom with the
 * buttons, pinch or double-click (the wheel scrolls the page).
 */
export default function PropertyMap({
  brand,
  place,
  address,
  center,
  markers,
  frameKey,
  framePoints,
  inset,
  highlight,
  focus,
  full = false,
  onMarkerClick,
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const clickRef = useRef(onMarkerClick);
  clickRef.current = onMarkerClick;
  const highlightRef = useRef(highlight);
  highlightRef.current = highlight;
  const insetRef = useRef(inset);
  insetRef.current = inset;
  /** A place whose card opens once the map has moved to it and drawn its marker. */
  const pendingRef = useRef<string | null>(null);
  const drawRef = useRef<() => void>(() => {});
  const framedRef = useRef(false);

  // The map and the property's marker, once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = L.map(container, {
      center: [center.lat, center.lng],
      zoom: HOME_ZOOM,
      zoomControl: false,
      // The page scrolls with the wheel; zoom with the buttons, pinch or double-click
      scrollWheelZoom: false,
      // On touch screens one finger scrolls the page; two fingers move the map
      dragging: !L.Browser.mobile,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    // The basemap follows the site's light/dark theme
    let dark = isDark();
    const addBase = () => {
      container.classList.toggle('is-dark-base', dark);
      return L.maplibreGL({ style: dark ? STYLES.dark : STYLES.light, attribution: ATTRIBUTION } as L.LeafletMaplibreGLOptions & {
        attribution: string;
      }).addTo(map);
    };
    let base = addBase();
    const theme = new MutationObserver(() => {
      if (isDark() === dark) return;
      dark = isDark();
      base.remove();
      base = addBase();
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // The EPIISOD marker with the property's card above it, always shown. The icon is a
    // point at the marker's centre; the card and marker are placed around it in CSS.
    L.marker([center.lat, center.lng], {
      title: `${brand} ${place}`,
      keyboard: false,
      // Under the places' markers, so places right next door stay visible
      zIndexOffset: -1000,
      icon: L.divIcon({
        className: 'map-home',
        iconSize: [0, 0],
        html: `
          <div class="map-home__card">
            <p class="map-home__name">${escape(brand)} <em>${escape(place)}</em></p>
            <p class="map-home__address">${escape(address)}</p>
            <img class="map-home__pointer" src="${pointer}" width="23" height="17" alt="" />
          </div>
          <img class="map-home__mark" src="${marker}" width="140" height="190.5" alt="" />`,
      }),
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    // A place's card replaces the property's while it's open
    map.on('popupopen', () => container.classList.add('has-popup'));
    map.on('popupclose', () => container.classList.remove('has-popup'));
    mapRef.current = map;
    // Leaflet measures its box once; re-measure if the layout around it changes
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => {
      ro.disconnect();
      theme.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      framedRef.current = false;
      markersRef.current.clear();
    };
  }, [brand, place, address, center]);

  // The places' markers, gathered into clusters when zoomed out and redrawn on zoom
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    const draw = () => {
      layer.clearLayers();
      markersRef.current.clear();
      const zoom = map.getZoom();
      const groups = new Map<string, MapMarker[]>();
      markers.forEach((m) => {
        const cell =
          zoom >= CLUSTER_BELOW
            ? m.id
            : (() => {
                const p = map.project([m.place.lat, m.place.lng], zoom);
                return `${Math.floor(p.x / CLUSTER_CELL)}:${Math.floor(p.y / CLUSTER_CELL)}`;
              })();
        groups.set(cell, [...(groups.get(cell) ?? []), m]);
      });

      groups.forEach((group) => {
        if (group.length === 1) {
          const m = group[0];
          const lit = m.id === highlightRef.current;
          const mk = L.marker([m.place.lat, m.place.lng], {
            title: m.place.name,
            zIndexOffset: lit ? 900 : 0,
            icon: L.divIcon({
              className: `map-marker${lit ? ' is-lit' : ''}`,
              html: `<i style="--icon:url('${m.icon}')"></i>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
              popupAnchor: [0, -18],
            }),
          })
            .bindPopup(popupHtml(m), {
              className: 'map-popup',
              maxWidth: 240,
              autoPanPaddingTopLeft: [insetRef.current.left + 16, insetRef.current.top + 16],
              autoPanPaddingBottomRight: [16, (insetRef.current.bottom ?? 0) + 16],
            })
            .on('click', () => clickRef.current(m.id))
            .addTo(layer);
          markersRef.current.set(m.id, mk);
          return;
        }
        // Several places: one marker at their middle, with the count; it zooms in on them
        const lat = group.reduce((s, m) => s + m.place.lat, 0) / group.length;
        const lng = group.reduce((s, m) => s + m.place.lng, 0) / group.length;
        L.marker([lat, lng], {
          title: `${group.length} places`,
          icon: L.divIcon({
            className: 'map-cluster',
            html: `<span>${group.length}</span>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          }),
        })
          .on('click', () => {
            const inset = insetRef.current;
            map.flyToBounds(L.latLngBounds(group.map((m) => [m.place.lat, m.place.lng] as [number, number])), {
              paddingTopLeft: [inset.left + 48, inset.top + 48],
              paddingBottomRight: [48, (inset.bottom ?? 0) + 48],
              maxZoom: CLUSTER_BELOW,
              duration: 0.6,
            });
          })
          .addTo(layer);
      });

      // A place picked from the list opens its card once its marker is drawn
      const pending = pendingRef.current && markersRef.current.get(pendingRef.current);
      if (pending) {
        pendingRef.current = null;
        pending.openPopup();
      }
    };

    drawRef.current = draw;
    draw();
    map.on('zoomend', draw);
    return () => {
      map.off('zoomend', draw);
    };
  }, [markers]);

  // Frame the places shown (keeping the property in view, and clear of the list and
  // filters) whenever the filters change. The first framing doesn't animate.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.closePopup();
    // The map may have just changed size (full screen on a phone)
    map.invalidateSize({ animate: false });
    const points = [L.latLng(center.lat, center.lng), ...framePoints.map((p) => L.latLng(p.lat, p.lng))];
    const clear = insetRef.current;
    const options: L.FitBoundsOptions = {
      paddingTopLeft: [clear.left + 32, Math.max(clear.top, 150)],
      paddingBottomRight: [56, Math.max(48, (clear.bottom ?? 0) + 24)],
      maxZoom: 16,
    };
    if (framedRef.current) map.flyToBounds(L.latLngBounds(points), { ...options, duration: 0.8 });
    else map.fitBounds(L.latLngBounds(points), { ...options, animate: false });
    framedRef.current = true;
    // Only when the filters change, not whenever the list is rebuilt with them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameKey, center]);

  // Light the place under the pointer in the list (or the chosen one)
  useEffect(() => {
    markersRef.current.forEach((m, id) => {
      m.getElement()?.classList.toggle('is-lit', id === highlight);
      m.setZIndexOffset(id === highlight ? 900 : 0);
    });
  }, [highlight, markers]);

  // Move to the place picked in the list and open its card, zoomed in far enough that
  // its marker has left any cluster
  useEffect(() => {
    const map = mapRef.current;
    const target = focus && markers.find((m) => m.id === focus.id);
    if (!map || !target) return;
    pendingRef.current = target.id;
    const open = () => {
      // A zoom has already drawn the markers (and opened the card); otherwise draw now
      if (pendingRef.current) drawRef.current();
      pendingRef.current = null;
    };
    map.once('moveend', open);
    const inset = insetRef.current;
    map.flyToBounds(L.latLngBounds([[target.place.lat, target.place.lng]]), {
      paddingTopLeft: [inset.left + 40, inset.top + 190],
      paddingBottomRight: [40, (inset.bottom ?? 0) + 40],
      maxZoom: Math.max(map.getZoom(), CLUSTER_BELOW),
      duration: 0.6,
    });
    return () => {
      map.off('moveend', open);
    };
    // A new pick, not a changed list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  // Touch screens: one finger moves the map only while it fills the screen
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !L.Browser.mobile) return;
    if (full) map.dragging.enable();
    else map.dragging.disable();
  }, [full]);

  return (
    <div
      ref={containerRef}
      className="property-map"
      role="region"
      aria-label={`Map of places near ${brand} ${place}`}
    />
  );
}
