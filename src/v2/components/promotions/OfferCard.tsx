import type { Offer } from './promotionsData';
import lightningWhite from '../../../assets/promotions/lightning-white.svg';
import lightningDark from '../../../assets/promotions/lightning-dark.svg';
import arrowRight from '../../../assets/loc-arrow-right.svg';
import './OfferCard.css';

const TAGS = {
  exclusive: { label: 'Exclusive Offer', icon: lightningWhite },
  'direct-debit': { label: 'Exclusive Offer via Direct Debit', icon: lightningDark },
};

/**
 * An offer on the Promotions page (Figma 786:10998): photo with its offer tag, the title,
 * two lines of description and a Learn more link. The photo eases in a touch on hover.
 */
export default function OfferCard({ offer }: { offer: Offer }) {
  const tag = TAGS[offer.tag];
  return (
    <article className="offer-card">
      <div className="offer-card__image">
        <img src={offer.image} alt="" />
        <p className={`offer-card__tag offer-card__tag--${offer.tag}`}>
          <img src={tag.icon} width={16} height={16} alt="" />
          {tag.label}
        </p>
      </div>
      <div className="offer-card__body">
        <div className="offer-card__text">
          <h3 className="offer-card__title">{offer.title}</h3>
          <p className="type-body-m offer-card__description">{offer.text}</p>
        </div>
        <a href={`/v2/promotions/${offer.id}`} className="offer-card__link">
          <span>Learn more</span>
          <img src={arrowRight} width={24} height={24} alt="" />
        </a>
      </div>
    </article>
  );
}
