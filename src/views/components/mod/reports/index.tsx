import React from 'react';
import { hot } from 'react-hot-loader/root';

function LogReport() {
  return (
    <h1>
      Hello
      <button
        onClick={() => {
          console.log('HI');
        }}
      >
        CLICK ME
      </button>
    </h1>
  );
}

export default hot(LogReport);
