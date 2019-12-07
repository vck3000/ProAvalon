function goBack() {
    // window.history.back();
    // redirect back to forum page
    window.location.replace('/forum');
}


function showAddComment() {
    if ($('.addCommentDiv')[0].style.display === 'block') {
        $('.addCommentDiv')[0].style.display = 'none';
    } else {
        $('.addCommentDiv')[0].style.display = 'block';
    }
}


//= =============================================================================
// Attach all the reply anchor links to their respective replyBox
//= =============================================================================

// get all the reply anchor links
const replies = document.querySelectorAll('.reply');
// for each anchor link, add an event listener to its respective replyBox
replies.forEach((reply) => {
    reply.addEventListener('click', function () {
        let parent = this.parentNode;
        // go up one more level
        parent = parent.parentNode;
        // get the child nodes of parent
        const { childNodes } = parent;

        let replyBox;
        // Among all the childNodes, find a replyBox (that will be its respective replyBox)
        for (let i = 0; i < childNodes.length; i++) {
            if (childNodes[i].classList && childNodes[i].classList.contains('replyBox')) {
                replyBox = childNodes[i];
                break;
            }
        }
        // Toggle its hidden state to show/hide
        if (replyBox) {
            replyBox.classList.toggle('hidden');
            console.log(replyBox.querySelector('textarea'));
            $(replyBox.querySelector('textarea')).summernote();
        }
    });
});


//= =============================================================================
// Attach all the likes to the ajax requestse
//= =============================================================================

// get all the reply anchor links
const likes = document.querySelectorAll('.like');
// for each anchor link, add an event listener to its respective replyBox
likes.forEach((like) => {
    like.addEventListener('click', function () {
        const thisLike = this;

        const idofelement = this.getAttribute('idofelement');
        const typeofelement = this.getAttribute('typeofelement');

        const idOfReply = this.getAttribute('idofreply');
        const idOfComment = this.getAttribute('idofcomment');
        const idOfForum = this.getAttribute('idofforum');


        console.log(idOfReply);
        console.log(idOfComment);
        console.log(idOfForum);


        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', `/forum/ajax/like/${typeofelement}/${idOfForum}=${idOfComment}=${idOfReply}`, true);

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                const message = xmlhttp.responseText;
                console.log(message);

                if (message === 'liked') {
                    $(thisLike).notify('Liked', { position: 'right', autoHideDelay: 1000, className: 'success' });
                    $(`#${idofelement}likes`)[0].innerText = parseInt($(`#${idofelement}likes`)[0].innerText) + 1;
                    $(thisLike)[0].innerText = 'Unlike';
                } else if (message === 'unliked') {
                    $(thisLike).notify('Unliked', { position: 'right', autoHideDelay: 1000, className: 'info' });
                    $(`#${idofelement}likes`)[0].innerText = parseInt($(`#${idofelement}likes`)[0].innerText) - 1;
                    $(thisLike)[0].innerText = 'Like';
                } else if (message === 'You need 10 games to like a forum/comment.') {
                    $(thisLike).notify('You need 10 games to like a forum/comment.', { position: 'right', autoHideDelay: 3000, className: 'error' });
                }
                else {
                    $(thisLike).notify('Error! Something went wrong...', { position: 'right', autoHideDelay: 1000, className: 'error' });
                }
            }
        };
        xmlhttp.send();
    });
});


//= =============================================================================
// Attach all the Delete anchor links to their respective replyBox
//= =============================================================================

// get all the delete anchor links
var deletes = document.querySelectorAll('.deleteComment');
// for each anchor link, add an event listener to its respective replyBox
deletes.forEach((singleDelete) => {
    singleDelete.addEventListener('click', function () {
        const linkToDelete = this.getAttribute('linktodelete');

        swal({
            title: 'Are you sure you want to delete your comment?',
            type: 'warning',
            showCancelButton: true,
            reverseButtons: true,
        })
            .then((result) => {
                if (result.value) {
                    $.ajax({
                        type: 'DELETE',
                        url: linkToDelete,
                        // data: "name=someValue",
                    });

                    swal('Your comment will be deleted.').then(() => {
                        location.reload();
                    });
                } else {
                    swal('Nothing was deleted.');
                }
            });
    });
});

//= =============================================================================
// Attach all the Delete anchor links to their respective replyBox
//= =============================================================================

// get all the delete anchor links
var deletes = document.querySelectorAll('.deleteCommentReply');
// for each anchor link, add an event listener to its respective replyBox
deletes.forEach((singleDelete) => {
    singleDelete.addEventListener('click', function () {
        const linkToDelete = this.getAttribute('linktodelete');

        swal({
            title: 'Are you sure you want to delete your reply?',
            type: 'warning',
            showCancelButton: true,
            reverseButtons: true,
        })
            .then((result) => {
                if (result.value) {
                    $.ajax({
                        type: 'DELETE',
                        url: linkToDelete,
                        // data: "name=someValue",
                    });

                    swal('Your reply will be deleted. ').then(() => {
                        location.reload();
                    });
                } else {
                    swal('Nothing was deleted.');
                }
            });
    });
});


//= =============================================================================
// Attach all the Edit anchor links to enable editing:
//= =============================================================================
// Show the cancel/submit button
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
