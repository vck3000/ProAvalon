import React from "react";
import { hydrate } from "react-dom";
import TimerModal from './index';

hydrate(<TimerModal />,document.getElementById('Timer'));