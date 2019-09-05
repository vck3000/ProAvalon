$(document).ready(() => {
    checkStatusBarWithHeight();
});
// if the users screen is big enough, then we can make the center status bar big
function checkStatusBarWithHeight() {
    const cutOffHeight = 800;
    if ($(window).height() > cutOffHeight) {
        $('#status').removeClass('well-sm');
    } else {
        $('#status').addClass('well-sm');
        $('#status').addClass('well-sm');
    }
}

function setStatusBarText(strToSet) {
    document.querySelector('#status').innerText = strToSet;


    // to get the lengths of the words or usernames
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    ctx.font = `${$('#option_display_font_size_text').val()}px sans-serif`;

    const wid = ctx.measureText(strToSet).width;

    // console.log("total wid");
    // console.log($("#status").width());

    // console.log("wid of text");
    // console.log(wid);

    // console.log("wid of buttons");
    // console.log($(".game-buttons-div").width());

    const totalWid = $('#status').width();
    const widOfText = wid;
    const widOfButtons = $('.game-buttons-div').width();

    if ((widOfText + widOfButtons) > totalWid) {

        // $(".game-buttons-div").css("right", "0%");

        // $(".game-buttons-div .btn").addClass("btn-xs");


    }
}
