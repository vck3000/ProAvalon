import React from "react";
import { hydrate } from "react-dom";
import Timer from './index';

hydrate((<Timer initialTime={60} />), document.getElementById('Timer'));