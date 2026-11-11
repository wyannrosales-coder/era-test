import life1 from '../assets/life-1.jpg';
import life2 from '../assets/life-2.jpg';
import life3 from '../assets/life-3.jpg';
import life4 from '../assets/life-4.jpg';
import './LifeIntro.css';

type LifeIntroProps = {
  onNext: () => void;
};

export default function LifeIntro({ onNext }: LifeIntroProps) {
  return (
    <div className="life-intro">
      <div className="life-intro__heading" data-parallax>
        <div className="heading-group">
          <p className="eyebrow">life @ Epiisod</p>
          <h2 className="display-title">
            An <em className="medium">elevated</em>
            <br />
            student life
          </h2>
        </div>
        <button type="button" className="visually-hidden" onClick={onNext}>
          Explore student life
        </button>
      </div>

      <div className="life-intro__photo life-intro__photo--1" data-parallax>
        <img src={life1} alt="" draggable={false} />
      </div>
      <div className="life-intro__photo life-intro__photo--2" data-parallax>
        <img src={life2} alt="" draggable={false} />
      </div>
      <div className="life-intro__photo life-intro__photo--3" data-parallax>
        <img src={life3} alt="" draggable={false} />
      </div>
      <div className="life-intro__photo life-intro__photo--4" data-parallax>
        <img src={life4} alt="" draggable={false} />
      </div>
    </div>
  );
}
