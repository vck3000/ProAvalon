import React from 'react';
import { hydrate } from 'react-dom';
import Report from './index';

hydrate(<Report />, document.getElementById('reportDiv'));
hydrate(<Report />, document.getElementById('reportDivRoom'));
