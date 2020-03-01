import { ReactElement } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';
import { Button, Form } from 'semantic-ui-react';

import Nav from '../components/nav';
import { RootState } from '../store/index';
import { ThemeOptions, UserOptionsState } from '../store/userOptions/types';
import { setTheme } from '../store/userOptions/actions';
import { COMMON_COLORS } from '../components/colors';

const { GOLD, GOLD_HOVER } = COMMON_COLORS;

interface Props {
  theme: ThemeOptions;
  setTheme: typeof setTheme;
}

const Home = (props: Props): ReactElement => {
  const { theme } = props;
  // eslint-disable-next-line no-shadow
  const { setTheme } = props;

  return (
    <div className="background">
      <title>Home</title>
      <div className="nav_wrapper">
        <div className="nav_width_wrapper">
          <Nav />
        </div>
      </div>
      <div>
        <img
          src="/index/star-background-min.png"
          alt="proavalon"
          className="background_img_overlay"
        />

        <div className="center_div">
          <img src="/common/logo.png" alt="logo" className="logo" />
          <div className="deception">A GAME OF DECEPTION</div>
          <div className="outwit">CAN YOU OUTWIT YOUR OPPONENTS?</div>
          <div className="blurb">
            This is a free online version of the popular game The Resistance
            (designed by Don Eskridge), wherein a small band of revolutionaries
            must use logic and deduction in order to ferret out the spies who
            have infiltrated their ranks and are sabotaging the cell&apos;s
            presumably heroic acts of rebellion against government tyranny.
          </div>
          <div className="form_wrapper">
            <img
              src="/index/login-glow-min.png"
              className="login_glow"
              alt="login_glow"
            />
            <Form>
              <Form.Field>
                <Form.Input
                  className="myInput"
                  name="username"
                  icon="user"
                  iconPosition="left"
                  placeholder="Username"
                />
              </Form.Field>
              <Form.Field>
                <Form.Input
                  name="password"
                  icon="lock"
                  iconPosition="left"
                  placeholder="Password"
                />{' '}
              </Form.Field>
              <Button type="submit" className="login">
                Login
              </Button>
              <div className="signup">
                <Link href="/signup">
                  <a>Sign up</a>
                </Link>
              </div>
            </Form>
          </div>
          <div>
            Dark theme
            <input
              type="checkbox"
              checked={theme.name === 'night'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                const themeName = e.target.checked ? 'night' : 'day';
                setTheme(themeName);
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .background {
            background-color: ${theme.colors.BACKGROUND};
            z-index: -1;
          }

          .background .background_img_overlay {
            pointer-events: none;
            position: absolute;
            width: 100%;
            height: 100%;
          }

          .nav_wrapper {
            position: fixed;
            width: 100%;
            margin-top: 20px;
          }

          .nav_width_wrapper {
            width: 80%;
            margin: 0 auto;
          }

          .logo {
            max-width: 275px;
            width: 80%;
            pointer-events: none;
            user-select: none;
          }

          .center_div {
            color: ${theme.colors.COLOR};
            max-width: 490px;
            width: 90%;
            position: relative;
            top: 42%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
          }

          .form_wrapper {
            width: 100%;
            max-width: 250px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .login_glow {
            width: 100%;
            position: absolute;
            z-index: -1;
            pointer-events: none;
            user-select: none;
          }

          // We need the !important tags to override semantic
          // global is used to pass the styles down to children classes
          .form_wrapper :global(.login) {
            background: ${GOLD} none !important;
            width: 100%;
            color: white;
          }

          .form_wrapper :global(input::placeholder) {
            color: black !important;
          }

          .form_wrapper :global(.login:hover) {
            background: ${GOLD_HOVER} none !important;
          }

          .form_wrapper .signup {
            margin-top: 8px;
          }

          .form_wrapper .signup a {
            transition: color 0.1s ease;
            color: ${GOLD};
            font-family: Montserrat-Bold;
            text-decoration: underline;
          }

          .form_wrapper .signup a:hover {
            color: ${GOLD_HOVER};
          }

          .deception {
            padding-top: 20px;
            font-family: Montserrat-ExtraBold;
            font-size: 14px;
          }
          @media screen and (min-width: 200px) {
            .deception {
              font-size: calc(
                14px + ((28 - 14) * ((100vw - 200px) / (450 - 200)))
              );
            }
          }
          @media screen and (min-width: 450px) {
            .deception {
              font-size: 28px;
            }
          }

          .outwit {
            padding-top: 4px;
            font-family: Montserrat-Thin;
            font-size: 12px;
          }
          @media screen and (min-width: 200px) {
            .outwit {
              font-size: calc(
                12px + ((14 - 12) * ((100vw - 200px) / (450 - 200)))
              );
            }
          }
          @media screen and (min-width: 450px) {
            .outwit {
              font-size: 14px;
            }
          }

          .blurb {
            text-align: justify;
            text-justify: inter-word;
            text-align-last: center;
            margin-bottom: 25px;
            font-family: Montserrat-Light;
            font-size: 10px;
          }
          @media screen and (min-width: 200px) {
            .blurb {
              font-size: calc(
                10px + ((14 - 10) * ((100vw - 200px) / (450 - 200)))
              );
            }
          }
          @media screen and (min-width: 450px) {
            .blurb {
              font-size: 14px;
            }
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
          div#__next > div,
          div#__next > div > div {
            height: 100%;
          }
          body {
            margin: 0px;
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

const mapDispatchToProps = {
  setTheme,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
