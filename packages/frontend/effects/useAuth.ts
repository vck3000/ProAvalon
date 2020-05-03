import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { loginSuccess } from '../store/auth/actions';

export default function useAuth(): void {
  const dispatch = useDispatch();

  useEffect(() => {
    const encodedJwt = Cookies.get('AUTH_TOKEN');

    if (!encodedJwt) return;

    const { username }: { username: string } = JSON.parse(
      atob(encodedJwt.split('.')[1]),
    );

    dispatch(loginSuccess({ username }));
  }, []);
}
