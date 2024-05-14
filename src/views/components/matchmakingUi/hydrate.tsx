import React from 'react';
import { hydrate } from 'react-dom';
import Matchmaking from './index';

hydrate(<Matchmaking />, document.getElementById('matchmakingDiv'));
hydrate(<Matchmaking />, document.getElementById('matchmakingDivWithinRoom1'));
hydrate(<Matchmaking />, document.getElementById('matchmakingDivWithinRoom2'));
