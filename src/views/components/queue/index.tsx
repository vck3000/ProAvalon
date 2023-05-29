import React from 'react';
import { hot } from 'react-hot-loader/root';
import { MatchMakingModal } from './matchmakingModal';

function MatchMakingQueue() {
  return <MatchMakingModal />;
}

export default hot(MatchMakingQueue);