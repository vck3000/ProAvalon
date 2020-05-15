import { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setMobileView, setWindowDimensions } from '../store/system/actions';
import throttle from '../utils/throttle';
import { RootState } from '../store';

const Resize = (): ReactElement => {
  const dispatch = useDispatch();

  const mobileView = useSelector((state: RootState) => state.system.mobileView);

  // Set up window event listener to set mobileView, width and height.
  useEffect(() => {
    const MOBILE_VIEW_CUTOFF = 600;
    const resizeWindow = throttle((): void => {
      if (
        (window.innerWidth <= MOBILE_VIEW_CUTOFF && !mobileView) ||
        (window.innerWidth > MOBILE_VIEW_CUTOFF && mobileView)
      ) {
        dispatch(setMobileView(!mobileView));
      }
      // Always send out a width and height update.
      dispatch(setWindowDimensions(window.innerWidth, window.innerHeight));
    }, 100);

    resizeWindow();

    // Add event listener and remove when resize.
    window.addEventListener('resize', resizeWindow);
    return (): void => window.removeEventListener('resize', resizeWindow);
  }, [mobileView, dispatch]);

  return <></>;
};

export default Resize;
