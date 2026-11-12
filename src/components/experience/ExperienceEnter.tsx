import { PROPERTIES } from '../locationData';
import { experienceHref } from '../../lib/links';
import loungePhoto from '../../assets/experience/mosaic-lounge.jpg';
import './ExperienceEnter.css';

/** The properties offered, in order; each card uses its own photo. */
const CARDS = [
  { id: 'macquarie-park', image: loungePhoto },
  { id: 'bedford', image: undefined },
];

/**
 * "Enter the EPIISOD experience" (after the live v2 Experience page): one image card per
 * property, each opening that property's experience page. A property without one yet
 * shows "Coming soon" instead of a link (lib/links.ts lists the ones that exist).
 */
export default function ExperienceEnter({ id }: { id?: string }) {
  return (
    <section id={id} className="xp-enter" aria-labelledby="xp-enter-title">
      <div className="xp-enter__inner">
        <div className="heading-group xp-enter__heading">
          <p className="eyebrow">Experience EPIISOD</p>
          <h2 id="xp-enter-title" className="type-h2">
            Enter the EPIISOD <em>experience</em>
          </h2>
          <p className="type-body-l xp-enter__lede">Step inside and explore each EPIISOD residence.</p>
        </div>

        <ul className="xp-enter__cards">
          {CARDS.map(({ id: propertyId, image }) => {
            const property = PROPERTIES.find((p) => p.id === propertyId);
            if (!property) return null;
            const href = experienceHref(propertyId);
            const place = property.name.replace(/^EPIISOD\s+/, '');
            const body = (
              <>
                <img className="xp-enter__img" src={image ?? property.image} alt="" loading="lazy" />
                <span className="xp-enter__shade" aria-hidden />
                <span className="xp-enter__badge">{href ? 'Enter' : 'Coming soon'}</span>
                <span className="xp-enter__caption">
                  Experience EPIISOD <em>{place}</em>
                </span>
              </>
            );
            return (
              <li key={propertyId} className="xp-enter__item">
                {href ? (
                  <a className="xp-enter__card" href={href} aria-label={`Experience ${property.name}`}>
                    {body}
                  </a>
                ) : (
                  <div className="xp-enter__card is-soon">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
