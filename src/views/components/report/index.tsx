import React from 'react';
import { hot } from 'react-hot-loader/root';
import { TestModal } from './modal'

function Report() {
  return (
    <h1>
      Hi 
      <button onClick={() => {console.log("HI")}}>CLICK ME</button>
      <TestModal />
    </h1>
  );
}

export default hot(Report);
