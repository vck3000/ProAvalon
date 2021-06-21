import React from 'react';
import { hydrate } from 'react-dom';
import ModLog from './index';

hydrate(<ModLog />, document.getElementById('logsDiv'));
