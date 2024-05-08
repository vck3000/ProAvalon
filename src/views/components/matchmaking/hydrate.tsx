import React from 'react';
import { hydrate } from 'react-dom';
import MatchmakingButton from './index';

hydrate(<MatchmakingButton />, document.getElementById('ReadyPromptDiv'));
