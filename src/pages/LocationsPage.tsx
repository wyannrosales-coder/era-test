import { useState } from 'react';
import Nav from '../components/Nav';
import LocationsListing from '../components/locations/LocationsListing';
import type { LocationFilter } from '../components/locations/LocationsListing';
import StayConnected from '../components/StayConnected';
import Footer from '../components/Footer';
import { REGIONS } from '../components/locationData';

/** The country and city in the page's address (?country=…&city=…), if they're known. */
function filterFromUrl(): LocationFilter {
  const params = new URLSearchParams(window.location.search);
  const region = REGIONS.find((r) => r.name === params.get('country'));
  const city = params.get('city');
  const cityRegion = city ? REGIONS.find((r) => r.cities.includes(city)) : undefined;
  return {
    country: (cityRegion ?? region)?.name ?? null,
    city: cityRegion ? city : null,
  };
}

/** Keeps the address in step with the filter, so a filtered list can be shared. */
function writeFilterToUrl({ country, city }: LocationFilter) {
  const params = new URLSearchParams();
  if (country) params.set('country', country);
  if (city) params.set('city', city);
  const query = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
}

/**
 * Locations (Figma 1182:17801): the intro with the Country and City filters, every property
 * by region and city, the newsletter band and the footer. Reached from the nav's Locations
 * link, and from the homepage's search, which opens it filtered to the chosen city and
 * glides down to the list.
 */
export default function LocationsPage() {
  const [filter, setFilter] = useState<LocationFilter>(filterFromUrl);
  // Arriving from a search: glide to the list once the page has settled
  const [scrollTo] = useState(() => (filter.city || filter.country ? 1 : 0));

  const applyFilter = (next: LocationFilter) => {
    setFilter(next);
    writeFilterToUrl(next);
  };

  return (
    <>
      <Nav tone="cream" />
      <main>
        <LocationsListing filter={filter} onFilter={applyFilter} scrollTo={scrollTo} />
        <StayConnected exitParallax fromWhite />
      </main>
      <Footer />
    </>
  );
}
