function runPublicDataAvalon(gameDataInc) {
    var gd = gameDataInc;

    // Roles and cards special data
    if (gd) {
        // Show the assassin shot
        if (gd.publicData.roles.assassinShotUsername) {
            drawAssassinateIcon(getIndexFromUsername(gd.publicData.roles.assassinShotUsername));
        }
        if (gd.publicData.roles.assassinShotUsername2) {
            drawAssassinateIcon(getIndexFromUsername(gd.publicData.roles.assassinShotUsername2));
        }


        // Reset cards container
        $(".playerDiv").find(".cardsContainer")[0].innerHTML = "";

        //Draw cards:
        for (var key in gd.publicData.cards) {
            if (gd.publicData.cards.hasOwnProperty(key) === true) {
                // Skip if we don't have any record of the card to draw/display.
                if (icons.hasOwnProperty(key) === false) {
                    continue;
                }

                var index = gd.publicData.cards[key].index;

                var card;
                if (icons[key].iconType === "bootstrapGlyphicon") {
                    card = "<span data-toggle='tooltip' data-placement='left' title='" + icons[key].toolTip + "' class='cardObject glyphicon " + icons[key].glyph + "' style=''></span> ";
                }
                else if (icons[key].iconType === "base64") {
                    card = '<img class="cardObject" data-toggle="tooltip" data-placement="left" title="' + icons[key].toolTip + '" src="' + icons[key].glyph + '" />';
                }
                else {
                    card = "Undefined! Something went wrong.";
                }

                var padding = "<span class='cardObject glyphicon glyphicon-asterisk' style='visibility: hidden;'></span> ";

                $($(".playerDiv")[index]).find(".cardsContainer")[0].innerHTML += card;
                $($(".playerDiv")[index]).find(".cardsContainer")[0].innerHTML += padding;

                // Initialise the tooltip.
                $(".cardObject").tooltip();
            }
        }





    }
}



function drawAssassinateIcon(indexOfPlayer) {

    //set the div string and add the star\\
    var str = $("#mainRoomBox div")[indexOfPlayer].innerHTML;

    var darkModeEnabled = $("#option_display_dark_theme")[0].checked;
    var useBullet = $("#optionDisplayUseOldGameIcons")[0].checked;

    var icon;
    if (useBullet === true && darkModeEnabled === false) {
        icon = "bullet";
    }
    else if (useBullet === true && darkModeEnabled === true) {
        icon = "bulletDark";
    }
    else if (useBullet === false) {
        icon = "dagger";
    }

    str = str + "<span><img class='assassinateIcon' src='" + pics[icon].path + "' style='" + pics[icon].style + "'></span>";

    //update the str in the div
    $("#mainRoomBox div")[indexOfPlayer].innerHTML = str;

    if (useBullet === false) {
        // var raiseBy = $(".assassinateIcon").height()*0.22;
        playerRatio = $(".playerDiv").height() / 128;
        // k is a random constant to scale with
        var k = -20;
        $(".assassinateIcon").css("top", (playerRatio * k) + "px");
    }

    // $(".bullet")[0].style.top = 0;
}