import { combineReducers } from 'redux';

import onlinePlayers from './onlinePlayers/reducers';
import games from './games/reducer';

const lobbyReducer = combineReducers({
  onlinePlayers,
  games,
});

export default lobbyReducer;
