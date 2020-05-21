import { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';

import { logout, setSetting } from '../../store/user/actions';
import { userSelector } from '../../store/user/reducer';

type Props = {
  user: NonNullable<ReturnType<typeof userSelector>>;
};

const LoggedIn = ({ user }: Props): ReactElement => {
  const { displayName, settings } = user;
  const { theme } = settings;

  const dispatch = useDispatch();
  const doLogout = (): void => {
    dispatch(logout());
  };
  const setTheme = (): void => {
    dispatch(
      setSetting({
        setting: 'theme',
        value: theme === 'night' ? 'day' : 'night',
      }),
    );
  };

  return (
    <>
      <li>
        <button type="button" onClick={setTheme}>
          {theme}
        </button>
      </li>
      <li>
        <Link href="/profile">
          <a className="buttons">{displayName}</a>
        </Link>
      </li>
      <li>
        <button type="button" onClick={doLogout}>
          Logout
        </button>
      </li>
      <style jsx>
        {`
          li {
            display: flex;
          }
          a,
          button {
            font-weight: bold;
            color: white;
            background: var(--gold);
            padding: 0 0.5rem;
          }
          a {
            text-decoration: none;
            line-height: 2.25rem;
          }
          button {
            border: none;
            font-family: inherit;
            font-size: inherit;
          }
          a:hover,
          button:hover {
            background: var(--gold-hover);
          }
          li:last-child {
            margin-right: -18px;
            z-index: 1; /* make hover show over the banner end outline */
          }
          li:last-child:after {
            content: ' ';
            position: absolute;
            top: 0;
            right: -36px;
            border-right: 18px solid var(--background);
            border-top: 18px solid var(--gold);
            border-bottom: 18px solid var(--gold);
          }
          li:last-child:hover:after {
            border-color: var(--gold-hover) var(--background);
          }
        `}
      </style>
    </>
  );
};

const NavRight = (): ReactElement => {
  const user = useSelector(userSelector);

  return user ? <LoggedIn user={user} /> : <></>;
};

export default NavRight;
