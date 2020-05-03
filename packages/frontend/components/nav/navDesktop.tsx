import React, { ReactElement } from 'react';
import Link from 'next/link';

import NavRight from './navRight';

const NavDesktop = (): ReactElement => {
  return (
    <nav>
      <div className="nav_div">
        <div className="before_nav_div" />
        <ul>
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
        <NavRight />
      </div>

      <style jsx>
        {`
          nav {
            width: 100%;
          }
          nav > .nav_div {
            display: flex;
            position: relative;
            width: 100%;
            padding: 0;
            margin: 0 auto;
          }
          nav > .nav_div > ul {
            flex: 1;
            padding: 0;
            margin: 0;
            display: flex;
            justify-content: space-between;
            border-top: 2px solid var(--gold);
            border-bottom: 2px solid var(--gold);
          }
          // Left side is identical to right side except for a vertical flip.
          nav > .nav_div > .before_nav_div {
            height: 36px;
            width: 36px;
            background-color: var(--gold);
            clip-path: polygon(
              0 0,
              50% 50%,
              0 100%,
              100% 100%,
              100% 94.5%,
              13% 94.5%,
              58% 50%,
              13% 5.5%,
              100% 5.5%,
              100% 0
            );
          }
          li {
            display: flex;
            flex-grow: 1;
            list-style-type: none;
            text-align: center;
          }
          a {
            color: var(--gold);
            text-decoration: none;
            font-size: 16px;
            font-family: Montserrat-Bold;
            height: 100%;
            width: 100%;
            line-height: 32px;
          }
          a:hover {
            background: var(--gold);
            color: white;
          }
        `}
      </style>
    </nav>
  );
};

export default NavDesktop;
