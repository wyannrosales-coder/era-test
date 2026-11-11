import arrowRight from '../../../assets/loc-arrow-right.svg';
import '../property/Promotions.css';

/**
 * A promo card in a carousel row (Figma 1082:16919): photo, title, two lines of
 * description and a Learn more link to the offer's own page.
 */
export default function PromoCard({ promo }: { promo: { id: string; title: string; text: string; image: string } }) {
  return (
    <article className="promo-card">
      <div className="promo-card__image">
        <img src={promo.image} alt="" draggable={false} />
      </div>
      <div className="promo-card__body">
        <div className="promo-card__text">
          <h3 className="type-h4 promo-card__title">{promo.title}</h3>
          <p className="type-body-m promo-card__description">{promo.text}</p>
        </div>
        <a href={`/v2/promotions/${promo.id}`} className="promo-card__link" draggable={false}>
          <span>Learn more</span>
          <img src={arrowRight} width={24} height={24} alt="" />
        </a>
      </div>
    </article>
  );
}
