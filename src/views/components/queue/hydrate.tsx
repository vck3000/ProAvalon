import React from "react";
import { hydrate } from "react-dom";
import MatchMakingModal from './index';


hydrate(<MatchMakingModal />, document.getElementById('matchMakingTimer'));