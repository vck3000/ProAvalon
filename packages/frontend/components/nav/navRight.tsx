import { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';

import { RootState } from '../../store';
import { logout } from '../../store/auth/actions';
import { ILogoutAction } from '../../store/auth/action.types';

const LoggedIn = ({ username }: { username: string }): ReactElement => {
  const dispatch = useDispatch();

  return (
    <>
      <div style={{ display: 'flex' }}>
        <Link href="/profile">
          <a className="buttons">{username}</a>
        </Link>
        <a
          onClick={(): ILogoutAction => dispatch(logout())}
          onKeyPress={(): ILogoutAction => dispatch(logout())}
          role="button"
          tabIndex={0}
          className="buttons logout"
        >
          Logout
        </a>
      </div>
      <style jsx>
        {`
          .buttons {
            position: relative;
            font-family: 'Montserrat-Bold';
            color: white;
            padding: 8px;
            background: var(--gold);
          }
          .buttons:hover {
            background: var(--gold-hover);
          }
          .logout {
            margin-right: 18px;
            cursor: pointer;
          }
          .logout:after {
            content: ' ';
            position: absolute;
            top: 0;
            right: -18px;
            border-right: 18px solid var(--background);
            border-top: 18px solid var(--gold);
            border-bottom: 18px solid var(--gold);
          }
          .logout:hover:after {
            border-color: var(--gold-hover) var(--background);
          }
        `}
      </style>
    </>
  );
};

const NavRight = (): ReactElement => {
  const username = useSelector<RootState, string | undefined>(
    (state) => state.auth.user?.name,
  );

  return username ? (
    <LoggedIn username={username} />
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
