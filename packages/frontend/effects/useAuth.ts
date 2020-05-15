import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { loginSuccess } from '../store/user/actions';
import { userSelector } from '../store/user/reducer';

export default function useAuth(): ReturnType<typeof userSelector> {
  const user = useSelector(userSelector);

  const dispatch = useDispatch();

  useEffect(() => {
    if (user) return;
    const encodedJwt = Cookies.get('AUTH_TOKEN');

    if (!encodedJwt) return;

    const { username }: { username: string } = JSON.parse(
      atob(encodedJwt.split('.')[1]),
    );

    dispatch(
      loginSuccess({
        displayName: username,
        settings: { theme: 'night', buzzable: true },
      }),
    );
  }, [dispatch, user]);

  return user;
}
