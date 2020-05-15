import { ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { userSelector } from '../../store/user/reducer';
import { logout } from '../../store/user/actions';

const NavRightMobile = (): ReactElement => {
  const user = useSelector(userSelector);

  const dispatch = useDispatch();
  const doLogout = (): void => {
    dispatch(logout());
  };

  return user ? (
    <>
      <li>
        <Link href="/profile">
          <a>{user.displayName}</a>
        </Link>
      </li>
      <li>
        <a onClick={doLogout} onKeyPress={doLogout} role="button" tabIndex={0}>
          Logout
        </a>
      </li>
      <style jsx>
        {`
          li {
            list-style: none;
            padding: 10px 5px;
            margin: 0;
            font-weight: bold;
            cursor: pointer;
          }

          a {
            color: var(--gold);
            font-size: 20px;
            text-decoration: none;
          }
        `}
      </style>
    </>
  ) : (
    <></>
  );
};

export default NavRightMobile;
