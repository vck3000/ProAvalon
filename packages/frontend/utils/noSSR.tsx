/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';

interface INoSSRProps {
  children: any;
  fallback: any;
}

export const NoSSR = ({ children, fallback = null }: INoSSRProps): any => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return <>{isMounted ? children : fallback}</>;
};
