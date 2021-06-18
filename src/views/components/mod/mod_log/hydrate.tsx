import React from 'react';
import { hydrate } from 'react-dom';
import ModLog from './index';

hydrate(<ModLog />, document.getElementById('logsDiv'));

// const domContainer = document.querySelector('logsDiv');
// ReactDOM.render(<LogTable />, domContainer);
