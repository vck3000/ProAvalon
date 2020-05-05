import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';
import { Grid } from 'semantic-ui-react';

import { RootState } from '../../store';
import { MobileView as MobileViewType } from '../../store/system/types';

import NavDesktop from '../nav/navDesktop';
import NavMobile from '../nav/navMobile';

interface IOwnProps {
  children: React.ReactNode;
}

type Props = IOwnProps & IStateProps;

const DesktopView = (): ReactElement => (
  <>
    <Grid.Column width={4} style={{ textAlign: 'center' }}>
      <Link href="/">
        <a>
          <img
            src="/common/logo.png"
            alt="logo"
            style={{ maxWidth: '200px', width: '100%' }}
          />
        </a>
      </Link>
    </Grid.Column>
    <Grid.Column width={12}>
      <NavDesktop />
    </Grid.Column>
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

const Layout = ({ children, mobileView }: Props): ReactElement => (
  <Grid style={{ flexFlow: 'column', height: '100%', margin: 0 }}>
    <Grid.Row style={{ padding: '1rem', alignItems: 'center' }}>
      {mobileView ? <MobileView /> : <DesktopView />}
    </Grid.Row>
    {children}
  </Grid>
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
