import React, { ReactElement } from 'react';

const Taako = (): ReactElement => (
  <div className="taako_wrapper">
    <img src="/lobby/taako.png" alt="taako" className="taako" />
    <div className="taako_bubble">
      <div className="taako_text">
        <div>WELCOME TO</div>
        <div>PROAVALON!</div>
      </div>
    </div>
    <style jsx>
      {`
        @font-face {
          font-family: 'AmaticSC-Regular';
          src: url('/fonts/AmaticSC/AmaticSC-Regular.ttf');
        }

        .taako_wrapper {
          position: relative;
          user-select: none;
        }

        .taako {
          position: relative;
          max-width: 100px;
          width: 50%;
          z-index: 2;
        }

        .taako_bubble {
          position: absolute;
          box-sizing: content-box;
          display: block;
          width: 60%;
          max-width: 140px;
          height: 65%;
          top: 0px;
          left: 40%;
          background-color: #4c4b47;
          z-index: 1;

          border-radius: 55% 50% 30% 40% / 80% 55% 60% 40%;
        }

        .taako_bubble:after {
          content: '';
          position: absolute;
          top: 30%;
          left: -15%;
          border: 0 solid transparent;
          border-bottom: 25px solid #4c4b47;
          border-radius: 0 0 0 60px;
          width: 40%;
          height: 40%;
          z-index: -1;
          transform: rotate(-40deg);
        }

        .taako_text {
          position: relative;
          top: 7%;
          left: 13%;
          font-family: AmaticSC-Regular;
          font-size: 27px;
          line-height: 30px;
          color: white;
          transform: rotate(-10deg);
        }
      `}
    </style>
  </div>
);

export default Taako;
