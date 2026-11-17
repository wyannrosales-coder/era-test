import { PROPERTIES, REGIONS, type Property } from './locationData';
import { MegaMenuPanel } from './MegaMenu';
import { LOCATIONS_MENU_VARIANT, type NavVariant } from '../lib/navVariant';
import arrowRight from '../assets/menu-arrow-right.svg';
import './LocationsMenu.css';

type LocationsMenuProps = {
  id: string;
  open: boolean;
  onNavigate: () => void;
  variant?: NavVariant;
};

const regionOf = (p: Property) => REGIONS.find((r) => r.cities.includes(p.city))!;

/**
 * Option B: every property as a photo card, grouped by region, each linking to its page (a
 * coming-soon property to its coming-soon page, marked as such). Regions sit side by side, each
 * as wide as its cards, so one row of cards runs across the menu.
 */
function LocationsMenuB({ id, open, onNavigate }: LocationsMenuProps) {
  const groups = REGIONS.map((region) => ({
    region,
    // By city in the region's order, the open properties before the coming-soon ones
    properties: PROPERTIES.filter((p) => !p.comingSoon && p.href && regionOf(p) === region).sort(
      (x, y) =>
        Number(!!x.comingSoon) - Number(!!y.comingSoon) ||
        region.cities.indexOf(x.city) - region.cities.indexOf(y.city),
    ),
  })).filter((g) => g.properties.length);
  return (
    <MegaMenuPanel id={id} open={open} heading="Our locations">
      <div className="locations-cards">
        {groups.map(({ region, properties }) => (
          <RegionRow key={region.id} name={region.name} properties={properties} onNavigate={onNavigate} />
        ))}
      </div>
    </MegaMenuPanel>
  );
}

/** One region on its own row: its name, then a column per city, each city's properties stacked. */
function RegionRow({ name, properties, onNavigate }: { name: string; properties: Property[]; onNavigate: () => void }) {
  const cities = [...new Set(properties.map((p) => p.city))].sort((a, b) => a.localeCompare(b));
  return (
    <section className="locations-cards__region" aria-label={name}>
      <p className="locations-menu__region-name">{name}</p>
      <div className="locations-cards__cities">
        {cities.map((city) => (
          <div key={city} className="locations-cards__city">
            <p className="locations-cards__city-name">{city}</p>
            <ul className="locations-cards__list">
              {properties
                .filter((p) => p.city === city)
                .map((p) => (
                  <li key={p.id}>
                    <PropertyCard property={p} onNavigate={onNavigate} />
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/** A property: a small photo with its name beneath-right, linking to its page. */
function PropertyCard({ property, onNavigate }: { property: Property; onNavigate: () => void }) {
  const { name, comingSoon, href, openingYear } = property;
  const shortName = name.replace(/^EPIISOD\s+/, '');
  const body = (
    <>
      <span className="locations-card__photo">
        <img src={property.listingImage ?? property.image} alt="" loading="lazy" decoding="async" />
      </span>
      <span className="locations-card__text">
        <span className="locations-card__name">{shortName}</span>
        {comingSoon ? (
          <span className="locations-card__soon">Coming soon{openingYear ? ` ${openingYear}` : ''}</span>
        ) : (
          <span className="locations-card__cta">
            View property
            <img src={arrowRight} width={14} height={14} alt="" />
          </span>
        )}
      </span>
    </>
  );
  const cls = `locations-card${comingSoon ? ' is-soon' : ''}`;
  return href ? (
    <a href={href} className={cls} onClick={onNavigate}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function PropertyItem({ property, onNavigate }: { property: Property; onNavigate: () => void }) {
  const { name, address, comingSoon, href, experienceHref } = property;
  const content = (
    <>
      <span className="locations-menu__name-row">
        <span className="locations-menu__name">{name}</span>
        {comingSoon ? (
          <span className="locations-menu__soon">Soon</span>
        ) : (
          <span className="locations-menu__arrow">
            <img loading="lazy" decoding="async" src={arrowRight} width={16} height={16} alt="" />
          </span>
        )}
      </span>
      <span className="type-body-s locations-menu__address">{address}</span>
    </>
  );

  // Open properties always link through; coming-soon ones only once they have a page.
  return comingSoon && !href ? (
    <div className="locations-menu__property">{content}</div>
  ) : (
    <>
      <a href={href ?? '#'} className="locations-menu__property is-link" onClick={onNavigate}>
        {content}
      </a>
      {experienceHref && (
        <a href={experienceHref} className="locations-menu__experience" onClick={onNavigate}>
          Enter the experience
        </a>
      )}
    </>
  );
}

/**
 * Locations mega menu, expanded from the nav's "Locations" link (Figma 539:18628).
 * Regions on the left, their properties grouped by city in three columns; open
 * properties highlight on hover (Figma 539:19161). Option B: see LocationsMenuB.
 */
export default function LocationsMenu({ id, open, onNavigate, variant = LOCATIONS_MENU_VARIANT }: LocationsMenuProps) {
  if (variant === 'b') return <LocationsMenuB id={id} open={open} onNavigate={onNavigate} />;
  return (
    <MegaMenuPanel id={id} open={open} heading="Our locations">
      {REGIONS.map((region) => (
        <div key={region.id} className="locations-menu__row">
          <div className="locations-menu__region">
            <p className="locations-menu__region-name">{region.name}</p>
            <p className="locations-menu__region-summary">{region.summary}</p>
          </div>

          <div className="locations-menu__cities">
            {region.cities.map((city) => (
              <div key={city} className="locations-menu__city">
                <p className="locations-menu__city-name">{city}</p>
                {PROPERTIES.filter((p) => p.city === city).map((p) => (
                  <PropertyItem key={p.id} property={p} onNavigate={onNavigate} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </MegaMenuPanel>
  );
}
