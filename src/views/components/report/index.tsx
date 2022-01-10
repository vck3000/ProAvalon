import React from 'react';
import { hot } from 'react-hot-loader/root';

function Report() {
  return <h1>Hi <button onClick={() => {console.log("HI")}}>CLICK ME </button></h1>;
}

export default hot(Report);
