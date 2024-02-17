import React from 'react';
import { hydrate } from 'react-dom';
import ReadyPrompt from './index';

hydrate(<ReadyPrompt />, document.getElementById('ReadyPromptDiv'));
