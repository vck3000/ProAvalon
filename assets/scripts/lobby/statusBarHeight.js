$(document).ready(function(){
    checkStatusBarWithHeight();
});
//if the users screen is big enough, then we can make the center status bar big
function checkStatusBarWithHeight(){
    const cutOffHeight = 800
    if($(window).height() > cutOffHeight){
        $("#status").removeClass("well-sm");        
    }
    else{
        $("#status").addClass("well-sm");
        $("#status").addClass("well-sm");
    }


    

}