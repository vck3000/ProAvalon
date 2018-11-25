function runPublicDataAvalon(gameDataInc) {
    var gd = gameDataInc;

    // Roles and cards special data
    if(gd){
        // Show the assassin shot
        if(gd.publicData.roles.assassinShotUsername){
            drawBullet(getIndexFromUsername(gd.publicData.roles.assassinShotUsername));
        }

        // Draw the lady of the lake
        if(gd.publicData.cards.indexLadyHolder !== undefined){
            var index = gd.publicData.cards.indexLadyHolder;
            var lady = "<span data-toggle='tooltip' data-placement='left' title='Tooltip on left' class='cardObject glyphicon glyphicon-book' style=''></span> ";
            var padding = "<span class='cardObject glyphicon glyphicon-asterisk' style='visibility: hidden;'></span> ";

            $($(".playerDiv")[index]).find(".cardsContainer")[0].innerHTML += lady;
            $($(".playerDiv")[index]).find(".cardsContainer")[0].innerHTML += padding;

            $($(".playerDiv")[index]).find(".cardsContainer")[0].innerHTML += lady;
            $($(".playerDiv")[index]).find(".cardsContainer")[0].innerHTML += padding;

            // Initialise the tooltip.
            $(".cardObject").tooltip();

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