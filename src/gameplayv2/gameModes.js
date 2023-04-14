const avalonGetRoles = require('./avalon/indexRoles').getRoles;
const avalonGetPhases = require('./avalon/indexPhases').getPhases;
const avalonGetCards = require('./avalon/indexCards').getCards;
const avalonBotGetRoles = require('./avalonBot/indexRoles').getRoles;
const avalonBotGetPhases = require('./avalonBot/indexPhases').getPhases;
const avalonBotGetCards = require('./avalonBot/indexCards').getCards;

const AVALON = 'avalon';
const AVALON_BOT = 'avalonBot';
const GAME_MODE_NAMES = [AVALON, AVALON_BOT];

const isGameMode = (gameMode) => {
  return GAME_MODE_NAMES.indexOf(gameMode) !== -1;
};

const gameModeObj = {
  [AVALON]: {
    getRoles: avalonGetRoles,
    getPhases: avalonGetPhases,
    getCards: avalonGetCards,
  },
  [AVALON_BOT]: {
    getRoles: avalonBotGetRoles,
    getPhases: avalonBotGetPhases,
    getCards: avalonBotGetCards,
  },
};

module.exports = {
  AVALON,
  AVALON_BOT,
  GAME_MODE_NAMES,
  isGameMode,
  gameModeObj
};
