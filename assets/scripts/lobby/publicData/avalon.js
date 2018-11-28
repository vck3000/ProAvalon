//https://css-tricks.com/data-uris/

var cards = {
    lady: {
        glyph: "glyphicon-book",
        iconType: "bootstrapGlyphicon",
        toolTip: "Lady of the Lake"
    },

    sire: {
        glyph: "glyphicon-ice-lolly",
        iconType: "bootstrapGlyphicon",
        toolTip: "Sire of the Sea"
    },

    hammer: {
        // glyph: "glyphicon-ice-lolly",
        glyph: "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0OTEuNTQgNDkxLjU0IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0OTEuNTQgNDkxLjU0OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMjgyLjU4LDM4Ny40ODRIMzYuOTA5QzE2LjUzNCwzODcuNDg0LDAsNDA0LjAxNiwwLDQyNC4zOTR2NjcuMTE1aDMxOS40ODh2LTY3LjExNSAgICBDMzE5LjQ4OCw0MDQuMDE2LDMwMi45NTUsMzg3LjQ4NCwyODIuNTgsMzg3LjQ4NHoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00ODQuOTE2LDM5Mi42OUwyNjAuNjYsMTY4LjQzM2w0My4zMTUtNDMuMjM4YzcuMTQyLDYuMjk4LDE4LjEyNSw1Ljk5LDI0Ljg4My0wLjc2OGM3LjA2Ni03LjE0Miw3LjA2Ni0xOC41ODYsMC0yNS43MjggICAgTDIzNS40Nyw1LjM4N2MtNy4wNjYtNy4xNDItMTguNTg2LTcuMTQyLTI1LjY1MSwwYy03LjE0Miw3LjA2Ni03LjE0MiwxOC41ODYsMCwyNS42NTFsLTAuNzY4LTAuNzY4TDkwLjQ3MSwxNDguNzcybDAuNzY4LDAuODQ0ICAgIGMtNy4wNjYtNy4xNDItMTguNTg2LTcuMTQyLTI1LjY1MSwwYy03LjE0Miw3LjA2Ni03LjE0MiwxOC41ODYsMCwyNS42NTJsOTMuMzEyLDkzLjM4OGM3LjE0Miw3LjA2NiwxOC42NjIsNy4wNjYsMjUuNzI4LDAgICAgYzcuMDY2LTcuMTQyLDcuMDY2LTE4LjU4NSwwLTI1LjcyNmwwLjc2OCwwLjc2Nmw0My4zMTUtNDMuMjM4bDIyNC4xNzksMjI0LjE4YzguODMyLDguODMyLDIzLjE5NCw4LjgzMiwzMi4wMjYsMCAgICBDNDkzLjc0OCw0MTUuODA2LDQ5My43NDgsNDAxLjUyMSw0ODQuOTE2LDM5Mi42OXoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K",
        iconType: "base64",
        toolTip: "Hammer"
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
        if(gd.publicData.roles.assassinShotUsername2){
            drawBullet(getIndexFromUsername(gd.publicData.roles.assassinShotUsername2));
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

                var card;
                if(cards[key].iconType === "bootstrapGlyphicon"){
                    card = "<span data-toggle='tooltip' data-placement='left' title='" + cards[key].toolTip + "' class='cardObject glyphicon " + cards[key].glyph + "' style=''></span> ";
                }
                else if(cards[key].iconType === "base64"){
                    card = '<img class="cardObject" data-toggle="tooltip" data-placement="left" title="' + cards[key].toolTip + '" src="' + cards[key].glyph + '" />';
                }
                else{
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