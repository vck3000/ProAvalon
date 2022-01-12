import React from 'react';
import { hot } from 'react-hot-loader/root';
import { TestModal } from './modal';

function Report() {
  return (
    <h1>
      <TestModal />
    </h1>
  );
}

export default hot(Report);
