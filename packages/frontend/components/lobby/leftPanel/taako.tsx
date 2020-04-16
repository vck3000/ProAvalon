import React, { ReactElement } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../../store';
import { MobileView } from '../../../store/system/types';

interface IStateProps {
  mobileView: MobileView;
}

type Props = IStateProps;

const Taako = ({ mobileView }: Props): ReactElement => (
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
          width: ${mobileView ? '55%' : '50%'};
        }

        .taako_text {
          position: relative;
          width: ${mobileView ? '45%' : '50%'};
          max-width: 125px;
        }
      `}
    </style>
  </div>
);

const mapStateToProps = (state: RootState): IStateProps => ({
  mobileView: state.system.mobileView,
});

export default connect(mapStateToProps, null)(Taako as () => ReactElement);
