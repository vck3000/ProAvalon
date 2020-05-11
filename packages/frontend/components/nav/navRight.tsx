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
      <ul>
        <li>
          <a
            onClick={setTheme}
            onKeyPress={setTheme}
            role="button"
            tabIndex={0}
          >
            {theme}
          </a>
        </li>
        <li>
          <Link href="/profile">
            <a className="buttons">{displayName}</a>
          </Link>
        </li>
        <li>
          <a
            onClick={doLogout}
            onKeyPress={doLogout}
            role="button"
            tabIndex={0}
            className="logout"
          >
            Logout
          </a>
        </li>
      </ul>
      <style jsx>
        {`
          ul {
            display: flex;
            margin: 0;
            padding: 0;
          }
          li {
            display: flex;
            list-style-type: none;
          }
          a {
            font-weight: bold;
            color: white;
            padding: 8px;
            background: var(--gold);
            cursor: pointer;
          }
          a:hover {
            background: var(--gold-hover);
          }
          li:last-child {
            margin-right: 18px;
          }
          li:last-child:after {
            content: ' ';
            position: absolute;
            top: 0;
            right: 0;
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

  return user ? (
    <LoggedIn user={user} />
  ) : (
    <div
      style={{
        height: '36px',
        width: '36px',
        backgroundColor: 'var(--gold)',
        clipPath:
          'polygon(100% 0, 50% 50%, 100% 100%, 0 100%, 0 94.5%, 87% 94.5%, 42% 50%, 87% 5.5%, 0 5.5%, 0 0)',
      }}
    />
  );
};

export default NavRight;
