var cards = {
    lady: {
        glyph: "glyphicon-book",
        toolTip: "Lady of the Lake"
    },

    sire: {
        glyph: "glyphicon-ice-lolly",
        toolTip: "Sire of the Lake"
    }
}


function runPublicDataAvalon(gameDataInc) {
    var gd = gameDataInc;

    // Roles and cards special data
    if(gd){
        // Show the assassin shot
        if(gd.publicData.roles.assassinShotUsername){
            drawBullet(getIndexFromUsername(gd.publicData.roles.assassinShotUsername));
        }


        
        // Reset cards container
        $(".playerDiv").find(".cardsContainer")[0].innerHTML = "";

        //Draw cards:
        for(var key in gd.publicData.cards){
            if(gd.publicData.cards.hasOwnProperty(key) === true){
                // Skip if we don't have any record of the card to draw/display.
                if(cards.hasOwnProperty(key) === false){
                    continue;
                }

                var index = gd.publicData.cards[key].index;
                var card = "<span data-toggle='tooltip' data-placement='left' title='" + cards[key].toolTip + "' class='cardObject glyphicon " + cards[key].glyph + "' style=''></span> ";

                var padding = "<span class='cardObject glyphicon glyphicon-asterisk' style='visibility: hidden;'></span> ";

                $($(".playerDiv")[index]).find(".cardsContainer")[0].innerHTML += card;
                $($(".playerDiv")[index]).find(".cardsContainer")[0].innerHTML += padding;

                // Initialise the tooltip.
                $(".cardObject").tooltip();
            }
        }

        


        
    }
}



function drawBullet(indexOfPlayer) {

    //set the div string and add the star\\
    var str = $("#mainRoomBox div")[indexOfPlayer].innerHTML;

    var darkModeEnabled = $("#option_display_dark_theme")[0].checked;
    if(darkModeEnabled === true){
    str = str + "<span><img src='pictures/bullet-dark.png' class='bullet'></span>";
    }
    else{
    str = str + "<span><img src='pictures/bullet.png' class='bullet'></span>";
    }

    //update the str in the div
    $("#mainRoomBox div")[indexOfPlayer].innerHTML = str;

    // $(".bullet")[0].style.top = 0;
}