import React from "react";
import { hydrate } from "react-dom";
import MatchLoading from './index';


hydrate(<MatchLoading />, document.getElementById('matchMakingTimer'));
