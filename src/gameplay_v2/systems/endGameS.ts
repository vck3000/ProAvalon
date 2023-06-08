import { GameData } from '../gameEngine';
import { SendData, System } from './system';
import { Player } from '../player';

export class endGameS implements System {
  run(gameData: GameData, sendData: SendData): Player[] {
    const playerList: Player[] = gameData.players;
    const spyList: Player[] = [];
    const resistanceList: Player[] = [];

    // Sort players into two lists based on their role
    for (const player of playerList) {
      if (player.entity.components.find(component => component.name === 'spy')) {
        spyList.push(player);
      } else {
        resistanceList.push(player);
      }
    }

    // Check if the Resistance has completed three missions or if the spies have failed three missions
    const maxFailedMissions = gameData.rules.failedMissionsAllowed;
    const numFailedMissions = gameData.missions.filter(mission => !mission.completed && mission.failed).length;
    const numSuccessfulMissions = gameData.missions.filter(mission => mission.completed && !mission.failed).length;

    if (numSuccessfulMissions >= 3) {
      sendData({
        message: 'The Resistance has won!',
        data: resistanceList.map(player => player.username),
      });

      return playerList;
    }

    if (numFailedMissions >= maxFailedMissions) {
      sendData({
        message: 'The Spies have won!',
        data: spyList.map(player => player.username),
      });

      // Check if the Assassin has killed Merlin
      const assassin = playerList.find(player => player.entity.components.find(component => component.name === 'assassin'));
      const merlin = playerList.find(player => player.entity.components.find(component => component.name === 'merlin'));

      if (assassin && merlin && assassin.username !== merlin.username && merlin.entity.components.find(component => component.name === 'dead')) {
        sendData({
          message: 'Assassin has killed Merlin! The Spies win!',
          data: spyList.map(player => player.username),
        });
      }

      return playerList;
    }

    return playerList;
  }
}