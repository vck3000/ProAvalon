function goBack() {
    // window.history.back();
    //redirect back to forum page
    window.location.replace("/forum");
}


function showAddComment() {
    if($(".addCommentDiv")[0].style.display === "block"){
        $(".addCommentDiv")[0].style.display = "none";
    }
    else{
        $(".addCommentDiv")[0].style.display = "block";
    }
}


//==============================================================================
//Attach all the reply anchor links to their respective replyBox
//==============================================================================

//get all the reply anchor links
var replies = document.querySelectorAll(".reply");
//for each anchor link, add an event listener to its respective replyBox
replies.forEach(function(reply){
    reply.addEventListener("click", function(){
        var parent = this.parentNode;
        //go up one more level
        parent = parent.parentNode;
        //get the child nodes of parent
        var childNodes = parent.childNodes;

        var replyBox;
        //Among all the childNodes, find a replyBox (that will be its respective replyBox)
        for(var i = 0; i < childNodes.length; i++){
            if(childNodes[i].classList && childNodes[i].classList.contains("replyBox")){
                replyBox = childNodes[i];
                break;
            }
        }
        //Toggle its hidden state to show/hide
        if(replyBox){
            replyBox.classList.toggle("hidden");
            console.log(replyBox.querySelector("textarea"));
            $(replyBox.querySelector("textarea")).summernote();
        }
    });
});


//==============================================================================
//Attach all the Delete anchor links to their respective replyBox
//==============================================================================

//get all the delete anchor links
var deletes = document.querySelectorAll(".deleteComment");
//for each anchor link, add an event listener to its respective replyBox
deletes.forEach(function(singleDelete){
    singleDelete.addEventListener("click", function(){
        
        var linkToDelete = this.getAttribute('linktodelete');

        swal({
            title: "Are you sure you want to delete your comment?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {

            if (willDelete) {
                $.ajax({
                type: "DELETE",
                url: linkToDelete,
                // data: "name=someValue",
            });
            
            swal("Your comment will be deleted.").then(function(){
                location.reload();
            });

            } else {
            swal("Nothing was deleted.");
            }
        });
        
    });
});

//==============================================================================
//Attach all the Delete anchor links to their respective replyBox
//==============================================================================

//get all the delete anchor links
var deletes = document.querySelectorAll(".deleteCommentReply");
//for each anchor link, add an event listener to its respective replyBox
deletes.forEach(function(singleDelete){
    singleDelete.addEventListener("click", function(){
        
        var linkToDelete = this.getAttribute('linktodelete');

        swal({
            title: "Are you sure you want to delete your reply?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
    
            if (willDelete) {
                $.ajax({
                type: "DELETE",
                url: linkToDelete,
                // data: "name=someValue",
            });
            
            swal("Your reply will be deleted. ").then(function(){
                location.reload();
            });
    
            } else {
                swal("Nothing was deleted.");
            }
        });
    });
});


//==============================================================================    
//Attach all the Edit anchor links to enable editing:
//==============================================================================
//Show the cancel/submit button
// var edits = document.querySelectorAll(".edit");

// edits.forEach(function(edit){
//     edit.addEventListener("click", function(){
//         //get parent
//         var parent = this.parentNode;    
//         //Go up one more
//         parent = parent.parentNode;    
//         //get the child nodes of parent
//         var childNodes = parent.childNodes;


//         var buttonsDiv;
//         //Among all the childNodes, find a replyBox (that will be its respective replyBox)
//         for(var i = 0; i < childNodes.length; i++){
//             if(childNodes[i].classList && childNodes[i].classList.contains("mainCommentEditButtons")){
//                 buttonsDiv = childNodes[i];
//                 break;
//             }
//         }

//         //Toggle its hidden state to show/hide
//         if(buttonsDiv){
//             buttonsDiv.classList.toggle("hidden");
//         }


//         var para;
//         //Among all the childNodes, find a p
//         for(var i = 0; i < childNodes.length; i++){
//             if(childNodes[i].classList && childNodes[i].classList.contains("mainCommentText")){
//                 para = childNodes[i];
//                 break;
//             }
//         }

//         if(para.getAttribute("contenteditable") === "true"){
//             para.setAttribute("contenteditable", "false");
//         }
//         else{
//             para.setAttribute("contenteditable", "true");
//             para.focus();
//         }
        
        

//         console.log(para);

//     });
// });

