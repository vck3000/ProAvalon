import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head';
import Link from 'next/link';

import { RootState } from '../../store';
import { MobileView as MobileViewType } from '../../store/system/types';

import NavDesktop from '../nav/navDesktop';
import NavMobile from '../nav/navMobile';

interface IOwnProps {
  children: React.ReactNode;
  title?: string;
}

type Props = IOwnProps & IStateProps;

const DesktopView = (): ReactElement => (
  <>
    <div style={{ textAlign: 'center', width: '25%' }}>
      <Link href="/">
        <a>
          <img
            src="/common/logo.png"
            alt="logo"
            style={{ maxWidth: '200px', width: '100%' }}
          />
        </a>
      </Link>
    </div>
    <div style={{ flex: 1, paddingLeft: '1rem' }}>
      <NavDesktop />
    </div>
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

const Layout = ({ children, mobileView, title }: Props): ReactElement => (
  <>
    <Head>
      <title>{title || 'ProAvalon'}</title>
    </Head>
    <div style={{ display: 'flex', flexFlow: 'column', height: '100%' }}>
      <div style={{ display: 'flex', padding: '1rem', alignItems: 'center' }}>
        {mobileView ? <MobileView /> : <DesktopView />}
      </div>
      {children}
    </div>
  </>
);

interface IStateProps {
  mobileView: MobileViewType;
}

const mapStateToProps = (state: RootState): IStateProps => ({
  mobileView: state.system.mobileView,
});

export default connect(
  mapStateToProps,
  null,
)(Layout as ({ children }: IOwnProps) => ReactElement);
