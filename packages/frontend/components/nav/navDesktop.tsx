import React, { ReactElement, CSSProperties } from 'react';
import Link from 'next/link';

import NavRight from './navRight';

const NavDesktop = ({ style }: { style?: CSSProperties }): ReactElement => {
  return (
    <nav style={style}>
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
        <NavRight />
      </ul>

      <style jsx>
        {`
          nav {
            display: flex;
          }
          ul {
            position: relative;
            flex: 1;
            padding: 0;
            margin: 0;
            display: flex;
            list-style: none;
          }
          nav::before,
          nav::after {
            content: ' ';
            height: 2.25rem;
            width: 2.25rem;
            background: var(--gold);
          }
          nav::before {
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
          nav::after {
            clip-path: polygon(
              100% 0,
              50% 50%,
              100% 100%,
              0 100%,
              0 94.5%,
              87% 94.5%,
              42% 50%,
              87% 5.5%,
              0 5.5%,
              0 0
            );
          }
          li {
            display: flex;
            flex-grow: 1;
            text-align: center;
            border-top: 2px solid var(--gold);
            border-bottom: 2px solid var(--gold);
          }
          li:first-child a:hover::before,
          li:last-child a:hover::after {
            content: ' ';
            position: absolute;
            width: 18px;
            border-top: 18px solid var(--gold);
            border-bottom: 18px solid var(--gold);
            top: 0;
          }
          li:first-child a:hover::before {
            border-left: 18px solid var(--background);
            left: -36px;
          }
          /* banner right hover style when logged out */
          li:last-child a:hover::after {
            border-right: 18px solid var(--background);
            right: -36px;
            z-index: -1;
          }
          a {
            color: var(--gold);
            text-decoration: none;
            font-weight: bold;
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
