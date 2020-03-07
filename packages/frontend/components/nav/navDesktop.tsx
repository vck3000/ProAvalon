import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';

import { RootState } from '../../store';
import { ThemeOptions } from '../../store/userOptions/types';

interface IStateProps {
  theme: ThemeOptions;
}

type Props = IStateProps;

const NavDesktop = ({ theme }: Props): ReactElement => {
  return (
    <nav>
      <div className="nav_div">
        <span className="before_nav_div" />
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
        <span className="after_nav_div" />
      </div>

      <style jsx>
        {`
          nav {
            width: 100%;
          }
          nav > .nav_div {
            border-top: 2px solid ${theme.colors.GOLD};
            border-bottom: 2px solid ${theme.colors.GOLD};
            position: relative;
            width: 100%;
            padding: 2px 50px;
            margin: 0 auto;
          }
          nav > .nav_div > ul {
            padding: 0;
            margin: 0;
            display: flex;
            justify-content: space-between;
          }
          // This is for the triangle border on the right side
          nav > .nav_div > .after_nav_div {
            position: absolute;
            right: 0%;
            top: -2px;
            height: 41px;
            width: 41px;
            background-color: ${theme.colors.GOLD};
            clip-path: polygon(
              100% 0%,
              28% 50%,
              100% 100%,
              108% 100%,
              35% 50%,
              108% 0%
            );
          }
          // Left side is identical to right side except for a vertical flip.
          nav > .nav_div > .before_nav_div {
            position: absolute;
            left: 0%;
            top: -2px;
            height: 41px;
            width: 41px;
            background-color: ${theme.colors.GOLD};
            clip-path: polygon(
              100% 0%,
              28% 50%,
              100% 100%,
              108% 100%,
              35% 50%,
              108% 0%
            );
            transform: rotate(180deg);
          }
          li {
            display: flex;
            padding: 6px 8px;
          }
          a {
            color: ${theme.colors.GOLD};
            text-decoration: none;
            font-size: 16px;
            font-family: Montserrat-Bold;
          }
        `}
      </style>
    </nav>
  );
};

const mapStateToProps = (state: RootState): IStateProps => ({
  theme: state.userOptions.theme,
});

export default connect(mapStateToProps, null)(NavDesktop as () => ReactElement);
