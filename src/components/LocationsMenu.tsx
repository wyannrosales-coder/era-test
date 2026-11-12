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

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
/** "2 cities • 3 properties" for a set of properties. */
const summary = (properties: Property[]) =>
  `${plural(new Set(properties.map((p) => p.city)).size, 'city', 'cities')} • ${plural(properties.length, 'property', 'properties')}`;
const regionOf = (p: Property) => REGIONS.find((r) => r.cities.includes(p.city))!;

/**
 * Option B (Figma 1081:16430): the open properties by region and city, linking through;
 * beside them the coming-soon ones, named by region as information only.
 */
function LocationsMenuB({ id, open, onNavigate }: LocationsMenuProps) {
  const opened = PROPERTIES.filter((p) => !p.comingSoon);
  const soon = PROPERTIES.filter((p) => p.comingSoon);
  return (
    <MegaMenuPanel id={id} open={open} heading="Our locations">
      <div className="locations-menu-b">
        <div className={`locations-menu-b__open${soon.length ? '' : ' is-wide'}`}>
          {REGIONS.map((region) => {
            const properties = opened.filter((p) => regionOf(p) === region);
            if (!properties.length) return null;
            return (
              <div key={region.id} className="locations-menu-b__row">
                <div className="locations-menu__region">
                  <p className="locations-menu__region-name">{region.name}</p>
                  <p className="locations-menu__region-summary">{summary(properties)}</p>
                </div>
                <div className="locations-menu-b__cities">
                  {region.cities.map((city) => {
                    const inCity = properties.filter((p) => p.city === city);
                    if (!inCity.length) return null;
                    return (
                      <div key={city} className="locations-menu__city">
                        <p className="locations-menu__city-name">{city}</p>
                        {inCity.map((p) => (
                          <PropertyItem key={p.id} property={p} onNavigate={onNavigate} />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {soon.length > 0 && (
          <div className="locations-menu-b__soon">
            <p className="locations-menu-b__soon-title">{plural(soon.length, 'property', 'properties')} coming soon!</p>
            {REGIONS.map((region) => {
              const properties = soon.filter((p) => regionOf(p) === region);
              if (!properties.length) return null;
              return (
                <div key={region.id} className="locations-menu-b__soon-region">
                  <p className="locations-menu-b__soon-summary">
                    <strong>{region.name}</strong> • {summary(properties)}
                  </p>
                  <ul className="locations-menu-b__soon-list">
                    {properties.map((p) => (
                      <li key={p.id}>
                        <span className="locations-menu-b__soon-name">{p.name}</span>, {p.city}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MegaMenuPanel>
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
            <img src={arrowRight} width={16} height={16} alt="" />
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
