
$(document).ready(function () {
    $('#biography').summernote();
    
    $('#hideStats').prop('checked', '<%=userData.hideStats%>');
    
    let nationCode = '<%=userData.nationCode%>.toUpperCase()';
    let nationality = '<%=userData.nationality%>';
    
    if (nationCode && nationality && nationCode !== '' && nationality !== '') {
        console.log(      $("option:contains('" + nationality + "')")         );
        $("option:contains('" + nationality + "')").attr("selected", "selected");
        updateFlag();
    }
    else {
        $("option:contains('United Nations')").attr("selected", "selected");
        updateFlag();
    }
});

$("#selectNation").on("change", function (e) {
    updateFlag();
});

function updateFlag() {
    let countryCode = $("#selectNation").find(":selected").val();
    let countryName = $("#selectNation").find(":selected")[0].innerText;
    
    $("#nationality").val(countryName); 
    
    $("#flagSpan").removeClass();
    $("#flagSpan").addClass("flag-icon");
    $("#flagSpan").addClass("flag-icon-" + countryCode.toLowerCase());
}
