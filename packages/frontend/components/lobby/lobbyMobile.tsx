import { ReactElement, useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../store/index';
import { WindowDimensions } from '../../store/system/types';

import Chat from '../chat/chatContainer';
import HomeIndex from './leftPanel/homeIndex';
import GamesMenu from './rightPanel/gamesMenu';
import Layout from '../layout/layout';

const indicators = ['HOME', 'CHAT', 'GAMES'];
const slides = [<HomeIndex />, <Chat id="lobby" />, <GamesMenu />];

interface IStateProps {
  windowDimensions: WindowDimensions;
}

type Props = IStateProps;

const LobbyMobile = ({ windowDimensions }: Props): ReactElement => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(document.createElement('div'));

  const wrapperSliderRef = useRef(document.createElement('div'));

  useEffect(() => {
    // Do some fancy math to set the height of the wrapper_slider.
    const parent = wrapperSliderRef.current.parentElement;
    if (parent) {
      let height = parent.offsetHeight;

      for (let i = 0; i < parent.children.length; i += 1) {
        if (!parent.children[i].classList.contains('wrapper_slider')) {
          height -= parent.children[i].clientHeight;
        }
      }

      if (height > 0) {
        wrapperSliderRef.current.style.height = `${height.toString()}px`;
      }
    }
  });

  return (
    <Layout>
      <div className="wrapper_nav">
        <div className="carousel_nav">
          {slides.map((_slide, i) => {
            return (
              <button
                key={indicators[i]}
                type="button"
                onClick={(): void => {
                  sliderRef.current.scrollTo({
                    left: sliderRef.current.scrollWidth * (i / slides.length),
                    behavior: 'smooth',
                  });
                }}
                className={
                  i === activeIndex
                    ? 'carousel_indicator active'
                    : 'carousel_indicator'
                }
              >
                {indicators[i]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="wrapper_slider" ref={wrapperSliderRef}>
        <div
          className="slider"
          ref={sliderRef}
          onScroll={(): void => {
            const i = Math.round(
              (sliderRef.current.scrollLeft / sliderRef.current.scrollWidth) *
                slides.length,
            );
            setActiveIndex(i);
          }}
        >
          <div className="slider_content">
            {slides.map(
              (slide, i): ReactElement => {
                return (
                  <div
                    key={indicators[i]}
                    className="slide"
                    style={{ overflowY: 'scroll' }}
                  >
                    {slide}
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .top_nav {
            display: flex;
            justify-content: space-between;
          }

          .logo_nav {
            max-width: 160px;
            padding: 10px 0 5px 15px;
          }

          .wrapper {
            display: flex;
            flex-direction: column;
            margin: 0 auto;
            width: 100%;
            height: 100%;
          }

          .wrapper_slider {
            display: flex;
          }

          .carousel_nav {
            display: flex;
            justify-content: center;
            padding: 10px 0;
          }

          .carousel_indicator {
            font-family: Montserrat;
            font-weight: bold;
            background-color: var(--background);
            color: var(--text-gray);
            font-size: 18px;
            border-radius: 16px;
            margin: 0 12px;
            padding: 5px;
            border: none;
          }

          .carousel_indicator:focus {
            outline: none;
          }

          .carousel_indicator.active {
            background-color: var(--slide-gold-background) !important;
            color: var(--gold) !important;
          }

          .slider {
            flex-grow: 1;
            position: relative;
            margin: 0 auto;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-coordinate: 0 0;
            scroll-snap-points-x: repeat(100%);
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }

          .slider_content {
            height: 100%;
            display: flex;
            align-items: stretch;
          }

          .slide {
            height: 100%;
            min-width: ${windowDimensions.width}px;
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
            scroll-snap-align: start;
            scroll-snap-stop: always;

            padding: 15px;
          }

          .slide.active {
            display: block;
          }
        `}
      </style>
    </Layout>
  );
};

const mapStateToProps = (state: RootState): IStateProps => ({
  windowDimensions: state.system.windowDimensions,
});

export default connect(
  mapStateToProps,
  null,
)(LobbyMobile as () => ReactElement);
