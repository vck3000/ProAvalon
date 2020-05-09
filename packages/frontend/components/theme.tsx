import { ReactElement, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Theme = (): ReactElement => {
  const theme =
    useSelector((state: RootState) => state.user?.settings.theme) || 'night';

  useEffect(() => {
    if (theme === 'night') document.body.classList.add('night');
    else document.body.classList.remove('night');
  }, [theme]);

  return <></>;
};

export default Theme;
