import { ReactElement } from 'react';
import { useSelector } from 'react-redux';

import NavDesktop from '../nav/navDesktop';
import NavMobile from '../nav/navMobile';
import { RootState } from '../../store/index';
import LoginSignupForm from './loginSignUpForm';

const Index = (): ReactElement => {
  const mobileView = useSelector((state: RootState) => state.system.mobileView);

  return (
    <div className="background">
      {mobileView ? (
        <NavMobile />
      ) : (
        <NavDesktop
          style={{
            width: '80%',
            maxWidth: '1000px',
            margin: '30px auto 0 auto',
          }}
        />
      )}
      <div className="content_wrapper">
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
            <LoginSignupForm />
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .background {
            z-index: -1;
            height: 100%;
          }

          .background .background_img_overlay {
            pointer-events: none;
            position: absolute;
            width: 100%;
            height: 100%;
          }

          .content_wrapper {
            height: 100%;
          }

          .logo {
            max-width: 275px;
            width: 80%;
            pointer-events: none;
            user-select: none;
          }

          .center_div {
            color: var(--text);
            max-width: 490px;
            width: 90%;
            position: relative;
            top: 50%;
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
            background: var(--gold) none !important;
            width: 100%;
            color: white;
          }

          .form_wrapper :global(input::placeholder) {
            color: black !important;
          }

          .form_wrapper :global(.login:hover) {
            background: var(--gold-hover) none !important;
          }

          .deception {
            padding-top: 20px;
            font-weight: 800;
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
            font-weight: 100;
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
            font-weight: 300;
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
    </div>
  );
};

export default Index;
