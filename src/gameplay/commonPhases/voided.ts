/* Each phase must have:
- Name
- Whether to show guns or not
- GameMove to perform operations
- Buttons that are visible and what text they have
- Number of targets allowed to be selected
- Status message to display
*/

function Voided(thisRoom_:any) {
  this.thisRoom = thisRoom_;

  this.phase = 'voided';
  this.showGuns = true;
}

Voided.prototype.gameMove = function (socket:any, buttonPressed:any, selectedPlayers:any) {
};

Voided.prototype.buttonSettings = function (indexOfPlayer:number) {
  const obj = {
    green: {
      hidden:true,
      disabled:true,
      setText:'',
    },
    red: {
      hidden:true,
      disabled:true,
      setText:'',
    },
  };

  return obj;
};

Voided.prototype.numOfTargets = function(indexOfPlayer:number) : any {
  return null;
};

Voided.prototype.getStatusMessage = function (indexOfPlayer:number) {
  return 'Game is voided, you can only check the vote history and chat with other players.';
};

export default Voided;
