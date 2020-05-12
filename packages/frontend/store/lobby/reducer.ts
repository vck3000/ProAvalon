import { combineReducers } from 'redux';

import onlinePlayers from './onlinePlayers/reducers';

const lobbyReducer = combineReducers({
  onlinePlayers,
});

export default lobbyReducer;
