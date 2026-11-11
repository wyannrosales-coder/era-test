import { PROPERTIES, REGIONS, type Property } from './locationData';
import { MegaMenuPanel } from './MegaMenu';
import image from '../../assets/v2/mega-locations.jpg';
import arrowRight from '../../assets/v2/mega-arrow-right.svg';
import './MenuPanels.css';

type LocationsMenuProps = {
  id: string;
  open: boolean;
  onNavigate: () => void;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
/** "2 cities • 3 properties" for a set of properties. */
const summary = (properties: Property[]) =>
  `${plural(new Set(properties.map((p) => p.city)).size, 'city', 'cities')} • ${plural(properties.length, 'property', 'properties')}`;
const regionOf = (p: Property) => REGIONS.find((r) => r.cities.includes(p.city))!;

/**
 * Locations mega menu (Figma 1441:13723): a photo, the open properties by region (linking
 * to their pages) and, in a grey box, the coming-soon ones named as information only.
 */
export default function LocationsMenu({ id, open, onNavigate }: LocationsMenuProps) {
  const opened = PROPERTIES.filter((p) => !p.comingSoon);
  const soon = PROPERTIES.filter((p) => p.comingSoon);

  return (
    <MegaMenuPanel id={id} open={open} heading="Our locations">
      <div className="menu2">
        <img className="menu2__image menu2__image--locations" src={image} alt="" />

        <div className="menu2__regions">
          {REGIONS.map((region) => {
            const properties = opened.filter((p) => regionOf(p) === region);
            if (!properties.length) return null;
            return (
              <div key={region.id} className="menu2__region">
                <div className="menu2__region-head">
                  <p className="menu2__region-name">{region.name}</p>
                  <p className="menu2__region-meta">{summary(properties)}</p>
                </div>
                <div className="menu2__properties">
                  {properties.map((p) => (
                    <a key={p.id} href={p.href ?? '#'} className="menu2__property" onClick={onNavigate}>
                      <span className="menu2__property-city">{p.city}</span>
                      <span className="menu2__property-name">
                        {p.name}
                        <img src={arrowRight} width={16} height={16} alt="" />
                      </span>
                      <span className="menu2__property-address">{p.address}</span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {soon.length > 0 && (
          <aside className="menu2__soon">
            <p className="menu2__soon-title">{plural(soon.length, 'property', 'properties')} coming soon!</p>
            {REGIONS.map((region) => {
              const properties = soon.filter((p) => regionOf(p) === region);
              if (!properties.length) return null;
              return (
                <div key={region.id} className="menu2__soon-group">
                  <p className="menu2__soon-region">
                    <b>{region.name}</b> • {summary(properties)}
                  </p>
                  <ul className="menu2__soon-list">
                    {properties.map((p) => (
                      <li key={p.id}>
                        {p.name}
                        <span>, {p.city}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </aside>
        )}
      </div>
    </MegaMenuPanel>
  );
}
