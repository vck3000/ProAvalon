$(document).ready(() => {
    $("#dropDownNotification").on("click", function (event) {
        $(this).parent().toggleClass("open");
        // console.log("test");
        // console.log(this);
    });


    // $('.userNotificationIdToRemove').on('click', function (event) {
    // 	setTimeout(function(e){
    // 		$(event).parent("notificationsDropdown a").parent().toggleClass('open');
    // 	}, 100)
    // 	console.log("test");
    // 	console.log(this);
    // });


    $("body").on("click", (e) => {
        if (!$("#notificationsDropdown").is(e.target)
			&& $("#notificationsDropdown").has(e.target).length === 0
			&& $(".open").has(e.target).length === 0
        ) {
            $("#notificationsDropdown").removeClass("open");
        }
    });

    $(".notificationText").on("click", (e) => {
        if (e.innerText !== "a" && $(e.target).parent().parent().hasClass("unseen")) {
            // seenNotificationFunction
            // console.log($(e.target).parent().parent().find(".userNotificationIdToRemove")[0].innerHTML);
            const id = $(e.target).parent().parent().find(".userNotificationIdToRemove")[0].innerHTML;

            seenNotificationFunction(id);

            $(".badge")[0].innerHTML -= 1;

            $(e.target).parent().parent().removeClass("unseen");
        }
    });


    $(".hideAll").on("click", () => {
        const notifs = $("#notificationsList li");

        if (notifs) {
            for (let i = 1; i < notifs.length; i++) {
                // hideFunction(notifs[i].getAttribute("idOfNotif"));
                hideAllNotifs();
                notifs[i].remove();
                $(notifs[i]).next().remove();
            }

            $(".badge")[0].innerHTML = 0;

            $("#notificationsList hr").remove();
        }
    });


    $(".notificationHide").on("click", function () {
        // console.log("click");
        // console.log(this.children[0].innerHTML);
        hideFunction(this.children[0].innerHTML);

        // console.log(this.parent().innerHTML);

        const notifs = $("#notificationsList li");

        const notifsIds = $("#notificationsList li").find(".userNotificationIdToRemove");

        for (let i = 0; i < notifsIds.length; i++) {
            // console.log(notifs);

            if (notifs.length === 2) {
                notifs[1].innerHTML = "";
                $(".badge")[0].innerHTML = 0;
                // console.log("been here");
            } else if (notifsIds[i] && notifsIds[i].innerHTML === this.children[0].innerHTML) {
                // console.log(i);

                $(notifs[i + 1]).addClass("hidden");
                $(notifs[i + 1]).next().addClass("hidden");
                // notifs.splice(i, 1);

                if ($(this).parent().parent().hasClass("unseen")) {
                    $(".badge")[0].innerHTML -= 1;
                }

                break;
            }
        }
    });
});

function hideFunction(idOfNotification) {
    // console.log(idOfNotification);

    $.ajax({
        url: "/ajax/hideNotification",
        type: "GET",
        data: { idOfNotif: idOfNotification },
        success() { console.log("ajax success"); },
        error(err) { console.log(err); },
    });
}

function seenNotificationFunction(idOfNotification) {
    // console.log(idOfNotification);

    $.ajax({
        url: "/ajax/seenNotification",
        type: "GET",
        data: { idOfNotif: idOfNotification },
        success() { console.log("ajax success"); },
        error(err) { console.log(err); },
    });
}


function hideAllNotifs() {
    // console.log(idOfNotification);

    $.ajax({
        url: "/ajax/hideAllNotifications",
        type: "GET",
        success() { console.log("ajax success"); },
        error(err) { console.log(err); },
    });


    /*
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET","/ajax/hideNotification", true);

	console.log("/profile/getProfileDataAJAX/" + $("#profileUsername")[0].innerHTML);


	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			userData=JSON.parse(xmlhttp.responseText);
			console.log(userData);

			drawCharts();
		}
	}
	xmlhttp.send(); */
}


let a;

const optionsList = [
    "display",
    "notifications",
    "reset",
];

for (let i = 0; i < optionsList.length; i++) {
    $(`#${optionsList[i]}OptionsButton`).on("click", function () {
        // console.log(this);
        a = this;

        const openThisMenu = `${this.innerText.toLowerCase().slice(0, this.innerText.length)}OptionsMenu`;
        // console.log("open this: " + openThisMenu);

        closeAllMenuOptions();

        $(`#${openThisMenu}`).removeClass("hidden");


        removeMyActiveOffAllButtons();
        this.classList.add("myActive");
    });
}

function closeAllMenuOptions() {
    for (let i = 0; i < optionsList.length; i++) {
        $(`#${optionsList[i]}OptionsMenu`).addClass("hidden");
    }
}

function removeMyActiveOffAllButtons() {
    for (let i = 0; i < optionsList.length; i++) {
        $(`#${optionsList[i]}OptionsButton`).removeClass("myActive");
    }
}


// Collapse the mobile navbar if the user clicks out of it.
$(document).ready(() => {
    $(document).click((event) => {
        const clickover = $(event.target);
        const _opened = $(".navbar-collapse").hasClass("collapse in");

        // console.log(clickover);

        if (
            _opened
			&& !clickover.hasClass("navbar-toggler")
			&& !clickover.hasClass("badge")
			&& !clickover.hasClass("optionsCog")
			&& !clickover.hasClass("dropDownNotification")
		 ) {
            $("button.navbar-toggler").click();
        }
    });
});
