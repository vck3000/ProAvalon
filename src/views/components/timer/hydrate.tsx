import React from "react";
import { hydrate } from "react-dom";
import Timer from './index';

hydrate(<Timer />, document.getElementById('Timer'));