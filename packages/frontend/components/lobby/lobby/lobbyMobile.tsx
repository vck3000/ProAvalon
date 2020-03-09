import { ReactElement, useState, useRef } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';

import { RootState } from '../../../store/index';
import { ThemeOptions } from '../../../store/userOptions/types';
import { WindowDimensions } from '../../../store/system/types';

import NavIndex from '../../nav/navIndex';

import Chat from '../chat';
import LobbyLeftPanel from './lobbyLeftPanel';
import GamesMenu from '../gamesMenu/gamesMenu';

const indicators = ['LOBBY', 'CHAT', 'GAMES'];
const slides = [<LobbyLeftPanel />, <Chat />, <GamesMenu />];

interface IStateProps {
  theme: ThemeOptions;
  windowDimensions: WindowDimensions;
}

type Props = IStateProps;

const LobbyMobile = ({ theme, windowDimensions }: Props): ReactElement => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(document.createElement('div'));

  return (
    <>
      <div className="wrapper">
        <div className="top_nav">
          <Link href="/">
            <a>
              <img src="/common/logo.png" className="logo_nav" alt="logo_nav" />
            </a>
          </Link>
          <NavIndex />
        </div>
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

        <div className="wrapper_slider">
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
            <div className="slider-content">
              {slides.map(
                (slide, i): ReactElement => {
                  return (
                    <div key={indicators[i]} className="slide">
                      {slide}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .top_nav {
            display: -webkit-inline-box;
            justify-content: space-between;
          }

          .logo_nav {
            max-width: 200px;
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
            flex-grow: 1;
          }

          .carousel_nav {
            display: flex;
            justify-content: center;
            padding: 10px 0;
          }

          .carousel_indicator {
            font-family: Montserrat-Bold;
            background-color: ${theme.colors.BACKGROUND};
            color: ${theme.colors.TEXT_GRAY};
            font-size: 18px;
            border-radius: 16px;
            margin: 0 12px;
            padding: 5px;
          }

          .carousel_indicator.active {
            background-color: ${theme.colors.SLIDE_GOLD_BACKGROUND} !important;
            color: ${theme.colors.GOLD} !important;
          }

          .slider {
            position: relative;
            margin: 0 auto;
            height: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-coordinate: 0 0;
            scroll-snap-points-x: repeat(100%);
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }

          .slider-content {
            height: 100%;
            display: flex;
          }

          .slide {
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
    </>
  );
};

const mapStateToProps = (state: RootState): IStateProps => ({
  theme: state.userOptions.theme,
  windowDimensions: state.system.windowDimensions,
});

export default connect(
  mapStateToProps,
  null,
)(LobbyMobile as () => ReactElement);
