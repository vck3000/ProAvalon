
function Resistance(thisRoom_) {

    this.thisRoom = thisRoom_;

    this.role = "Resistance";
    this.alliance = "Resistance";

    this.see = function(){
        return undefined;
    }

    this.checkSpecialMove = function(){
        
    }

}


module.exports = Resistance;