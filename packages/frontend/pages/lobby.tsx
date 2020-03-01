import { ReactElement } from 'react';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';

import { RootState } from '../store/index';
import { ThemeOptions, UserOptionsState } from '../store/userOptions/types';

import OnlinePlayers from '../components/lobby/onlinePlayers';

interface Props {
  theme: ThemeOptions;
}

const Lobby = (props: Props): ReactElement => {
  const { theme } = props;

  return (
    <div className="container">
      <title>Lobby</title>
      <Grid divided="vertically" padded className="main_grid">
        <Grid.Column width={5} stretched>
          <Grid.Row>ProAvalon logo</Grid.Row>
          <Grid.Row>Taako</Grid.Row>
          <Grid.Row>Announcements</Grid.Row>
          <Grid.Row>Latest avatars</Grid.Row>
          <Grid.Row>
            <OnlinePlayers
              players={[
                { username: 'ProNub' },
                { username: 'Skies' },
                { username: 'Pam' },
                { username: 'Pam2' },
                { username: 'Pam3' },
                { username: 'Pam4' },
                { username: 'Pam5' },
                { username: 'Pam6' },
                { username: 'Pam7' },
                { username: 'Pam8' },
                { username: 'Pam9' },
              ]}
              maxHeight="350px"
            />
          </Grid.Row>
        </Grid.Column>

        <Grid.Column width={11}>
          <Grid.Row className="navbar">Navbar</Grid.Row>
          <Grid>
            <Grid.Row>
              <Grid.Column width={10}>Chat</Grid.Column>
              <Grid.Column width={6}>Games menu</Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
      </Grid>

      <style jsx>
        {`
          .container {
            // Required to compensate for Grid -1rem margin-top.
            padding-top: 1rem;
            background-color: ${theme.colors.BACKGROUND};
            z-index: -1;
            color: ${theme.colors.COLOR};
          }

          .ui.grid {
            margin-top: 0;
          }
        `}
      </style>
      <style global jsx>
        {`
          // CSS to make NextJS Page one page tall
          html,
          body,
          body > div:first-child,
          div#__next,
          div#__next > div {
            height: 100%;
          }

          body {
            margin: 0px;
          }

          .main_grid {
            height: 100vh;
          }
        `}
      </style>
    </div>
  );
};

const mapStateToProps = (
  state: RootState,
): Pick<UserOptionsState, 'theme'> => ({
  theme: state.userOptions.theme,
});

export default connect(mapStateToProps, null)(Lobby);
