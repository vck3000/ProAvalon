import React from 'react';
import ReactDOM from 'react-dom';
import Timer from './timer';

const storedValue = localStorage.getItem('timerValue');
const initialValue = storedValue ? JSON.parse(storedValue) : 60;

ReactDOM.render(
  <React.StrictMode>
    <Timer initialValue={initialValue} />
  </React.StrictMode>,
  document.getElementById('Timer')
);