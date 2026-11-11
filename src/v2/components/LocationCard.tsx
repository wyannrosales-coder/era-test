import type { HomeProperty as Property } from './homeLocations';
import globe from '../../assets/v2/loc-globe.svg';
import arrowRight from '../../assets/v2/loc-arrow-right.svg';
import './LocationCard.css';

/** Figma 1441:16184: white card, framed photo, city label, name, address and link. */
export default function LocationCard({ property }: { property: Property }) {
  const { name, address, city, country, image, crop, href } = property;
  return (
    <article className="location-card">
      <div className="location-card__image">
        {/* Figma's 360px crop frame, shown down to the 240px window */}
        <div className="location-card__crop">
          <img
            src={image}
            alt=""
            draggable={false}
            style={{ width: `${crop.width}%`, left: `${crop.left}%`, top: `${crop.top}%` }}
          />
        </div>
      </div>

      <p className="location-card__place">
        <img src={globe} width={16} height={16} alt="" />
        {city} • {country}
      </p>

      <div className="location-card__details">
        <div className="location-card__info">
          <h3 className="location-card__name">
            EPIISOD <em>{name}</em>
          </h3>
          <p className="location-card__address">{address}</p>
        </div>

        <a href={href} className="location-card__link">
          <span>View Property</span>
          <img src={arrowRight} width={24} height={24} alt="" />
        </a>
      </div>
    </article>
  );
}
