import { ReactElement, useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';

import { RootState } from '../../store/index';
import { ThemeOptions } from '../../store/userOptions/types';
import { WindowDimensions } from '../../store/system/types';

import NavIndex from '../nav/navIndex';

import Chat from './mainPanel/chat';
import HomeIndex from './leftPanel/homeIndex';
import GamesMenu from './rightPanel/gamesMenu';

const indicators = ['HOME', 'CHAT', 'GAMES'];
const slides = [<HomeIndex />, <Chat />, <GamesMenu />];

interface IStateProps {
  theme: ThemeOptions;
  windowDimensions: WindowDimensions;
}

type Props = IStateProps;

const LobbyMobile = ({ theme, windowDimensions }: Props): ReactElement => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(document.createElement('div'));

  const wrapperRef = useRef(document.createElement('div'));
  const wrapperDiv = wrapperRef.current;

  const wrapperSliderRef = useRef(document.createElement('div'));

  useEffect(() => {
    // Do some fancy math to set the height of the wrapper_slider.
    let height = wrapperDiv.offsetHeight;

    for (let i = 0; i < wrapperDiv.children.length; i += 1) {
      const child = wrapperDiv.children[i];
      if (!child.classList.contains('wrapper_slider')) {
        height -= wrapperDiv.children[i].clientHeight;
      }
    }
    if (height !== 0) {
      wrapperSliderRef.current.style.height = `${height.toString()}px`;
    }
  });

  return (
    <>
      <div className="wrapper" ref={wrapperRef}>
        <div>
          <div className="top_nav">
            <Link href="/">
              <a>
                <img
                  src="/common/logo.png"
                  className="logo_nav"
                  alt="logo_nav"
                />
              </a>
            </Link>
            <NavIndex />
          </div>
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
            font-family: Montserrat-Bold;
            background-color: ${theme.colors.BACKGROUND};
            color: ${theme.colors.TEXT_GRAY};
            font-size: 18px;
            border-radius: 16px;
            margin: 0 12px;
            padding: 4px 5px;
            border: none;
          }

          .carousel_indicator:focus {
            outline: none;
          }

          .carousel_indicator.active {
            background-color: ${theme.colors.SLIDE_GOLD_BACKGROUND} !important;
            color: ${theme.colors.GOLD} !important;
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
