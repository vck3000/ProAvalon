import React, { ReactElement } from 'react';

const Taako = (): ReactElement => (
  <div className="taako_wrapper">
    <img src="/lobby/taako.png" alt="taako" className="taako" />
    <img src="/lobby/taako-text.png" alt="taako_text" className="taako_text" />
    <style jsx>
      {`
        @font-face {
          font-family: 'AmaticSC-Regular';
          src: url('/fonts/AmaticSC/AmaticSC-Regular.ttf');
        }

        .taako_wrapper {
          user-select: none;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .taako {
          max-width: 125px;
          width: 50%;
          z-index: 2;
        }

        .taako_text {
          position: relative;
          width: 50%;
          max-width: 125px;
          z-index: 3;
        }
      `}
    </style>
  </div>
);

export default Taako;
