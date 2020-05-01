import React, { ReactElement } from 'react';
import Link from 'next/link';

import throttle from '../../utils/throttle';

const animateTime = 0.5;

const toggleMenu = throttle(
  (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.KeyboardEvent<HTMLDivElement>,
  ): void => {
    const parent = e.currentTarget.parentElement?.parentElement;
    if (parent) {
      const hamburgerCL = parent.getElementsByClassName('hamburger')[0]
        .classList;
      const overlayCL = parent.getElementsByClassName('overlay')[0].classList;
      const sideMenuCL = parent.getElementsByClassName('side_menu')[0]
        .classList;

      if (hamburgerCL.contains('active')) {
        overlayCL.remove('animate');
        sideMenuCL.remove('animate');

        hamburgerCL.remove('active');

        setTimeout(() => {
          overlayCL.remove('active');
          sideMenuCL.remove('active');
        }, animateTime * 1000);
      } else {
        hamburgerCL.add('active');
        overlayCL.add('active');
        sideMenuCL.add('active');

        setTimeout(() => {
          overlayCL.add('animate');
          sideMenuCL.add('animate');
        }, 50);
      }
    }
  },
  animateTime * 1000,
);

const NavMobile = (): ReactElement => {
  return (
    <>
      <div className="hamburger_wrapper">
        <button
          className="hamburger hamburger--minus"
          type="button"
          aria-label="Menu"
          aria-controls="navigation"
          onClick={toggleMenu}
        >
          <span className="hamburger-box">
            <span className="hamburger-inner" />
          </span>
        </button>
      </div>
      <div className="side_menu_wrapper">
        <div
          className="overlay"
          onClick={toggleMenu}
          onKeyDown={toggleMenu}
          role="button"
          tabIndex={0}
          aria-label="Menu Overlay"
        />
        <div className="side_menu">
          <div>
            <ul>
              <li>
                <Link href="/lobby">
                  <a>Lobby</a>
                </Link>
              </li>
              <li>
                <Link href="/rules">
                  <a>Rules</a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a>Community</a>
                </Link>
              </li>
              <li>
                <Link href="/stats">
                  <a>Stats</a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a>Development</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <style jsx>
        {`
          .wrapper {
          }

          .side_menu_wrapper {
            position: absolute;
            pointer-events: none;
            top: 0;
            left: 0;
            height: 100vh;
            width: 100vw;

            overflow: hidden;
            z-index: 10;
          }

          .overlay {
            position: absolute;
            pointer-events: auto;
            top: 0px;
            right: 0px;
            height: 100vh;
            width: 100vw;
            z-index: 2;
            background-color: rgba(0, 0, 0, 0.5); /* Black w/opacity */

            transition: ease ${animateTime / 2}s;
            transform: translateX(100%);

            display: none;
          }
          .overlay.active {
            display: block;
          }
          .overlay.animate {
            transform: translateX(0%);
          }
          .overlay:focus {
            outline: none;
          }

          .side_menu {
            position: absolute;
            pointer-events: auto;
            top: 0px;
            right: 0px;
            height: 100vh;
            z-index: 3;
            transition: ease ${animateTime}s;
            transform: translateX(100%);
            background-color: var(--background);

            padding-top: 60px;

            display: none;
          }
          .side_menu.active {
            display: block;
          }
          .side_menu.animate {
            transform: translateX(0%);
          }

          .side_menu ul {
            list-style: none;
            padding: 0 15px;
            margin: 0;
            box-sizing: border-box;
          }

          .side_menu li {
            list-style: none;
            padding: 10px 5px;
            margin: 0;

            font-family: Montserrat-Bold;
          }

          .side_menu li a {
            color: var(--gold);
            font-size: 20px;
          }

          .hamburger_wrapper {
            position: absolute;
            top: 0;
            right: 0;
          }

          /*! * Hamburgers * @description Tasty CSS-animated hamburgers * @author Jonathan Suh @jonsuh * @site https://jonsuh.com/hamburgers * @link https://github.com/jonsuh/hamburgers */
          .hamburger {
            padding: 15px 15px;
            display: inline-block;
            cursor: pointer;
            transition-property: opacity, filter;
            transition-duration: 0.15s;
            transition-timing-function: linear;
            font: inherit;
            color: inherit;
            text-transform: none;
            background-color: transparent;
            border: 0;
            margin: 0;
            overflow: visible;

            position: relative;
            z-index: 9999;
          }
          .hamburger:focus {
            outline: none;
          }
          .hamburger:hover {
            opacity: 0.7;
          }
          .hamburger.active:hover {
            opacity: 0.7;
          }
          .hamburger.active .hamburger-inner,
          .hamburger.active .hamburger-inner::before,
          .hamburger.active .hamburger-inner::after {
            background-color: var(--gold);
          }
          .hamburger-box {
            width: 40px;
            height: 24px;
            display: inline-block;
            position: relative;
          }
          .hamburger-inner {
            display: block;
            top: 50%;
            margin-top: -2px;
          }
          .hamburger-inner,
          .hamburger-inner::before,
          .hamburger-inner::after {
            width: 40px;
            height: 4px;
            background-color: var(--gold);
            border-radius: 4px;
            position: absolute;
            transition-property: transform;
            transition-duration: 0.15s;
            transition-timing-function: ease;
          }
          .hamburger-inner::before,
          .hamburger-inner::after {
            content: '';
            display: block;
          }
          .hamburger-inner::before {
            top: -10px;
          }
          .hamburger-inner::after {
            bottom: -10px;
          }
          /* * Minus */
          .hamburger--minus .hamburger-inner::before,
          .hamburger--minus .hamburger-inner::after {
            transition: bottom 0.08s 0s ease-out, top 0.08s 0s ease-out,
              opacity 0s linear;
          }
          .hamburger--minus.active .hamburger-inner::before,
          .hamburger--minus.active .hamburger-inner::after {
            opacity: 0;
            transition: bottom 0.08s ease-out, top 0.08s ease-out,
              opacity 0s 0.08s linear;
          }
          .hamburger--minus.active .hamburger-inner::before {
            top: 0;
          }
          .hamburger--minus.active .hamburger-inner::after {
            bottom: 0;
          }
        `}
      </style>
    </>
  );
};

export default NavMobile;
