import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import Link from 'next/link';

import { RootState } from '../../store';

import NavDesktop from '../nav/navDesktop';
import NavMobile from '../nav/navMobile';

const DesktopView = (): ReactElement => (
  <>
    <Link href="/">
      <a style={{ margin: 'auto' }}>
        <img
          src="/common/logo.png"
          alt="logo"
          style={{ maxWidth: '200px', width: '100%' }}
        />
      </a>
    </Link>
    <NavDesktop style={{ width: 'calc(75% - 1.5rem)', paddingLeft: '1rem' }} />
  </>
);

const MobileView = (): ReactElement => (
  <>
    <Link href="/">
      <a>
        <img
          src="/common/logo.png"
          alt="logo_nav"
          style={{ maxWidth: '160px' }}
        />
      </a>
    </Link>
    <NavMobile />
  </>
);

type Props = {
  children: React.ReactNode;
  title?: string;
};

const Layout = ({ children, title }: Props): ReactElement => {
  const mobileView = useSelector((state: RootState) => state.system.mobileView);

  return (
    <>
      <Head>
        <title>{title || 'ProAvalon'}</title>
      </Head>
      <div style={{ display: 'flex', flexFlow: 'column', height: '100%' }}>
        <header
          style={{ display: 'flex', padding: '1rem', alignItems: 'center' }}
        >
          {mobileView ? <MobileView /> : <DesktopView />}
        </header>
        {children}
      </div>
    </>
  );
};

export default Layout;
