import React from "react";
import { hydrate } from "react-dom";
import MatchMakingQueue from './index';


hydrate(<MatchMakingQueue />, document.getElementById('matchMakingTimer'));