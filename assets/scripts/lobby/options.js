//= ======================================================================
// COOKIE SETUP!!!!!! Simple cookies for user options to persist
//= ======================================================================
var userOptions = {

    lastSettingsResetDate: {
        defaultValue: new Date().toString(),
        onLoad() { },
        initialiseEventListener() { },
    },

    optionDisplayFontSize: {
        defaultValue: '14',
        onLoad() {
            // get cookie data
            const fontSize = docCookies.getItem('optionDisplayFontSize');

            // set the value in the users display
            $('#option_display_font_size_text')[0].value = fontSize;

            // make the font size changes
            $('html *').css('font-size', `${fontSize}px`);
            draw();
        },
        initialiseEventListener() {
            $('#option_display_font_size_text').on('change', () => {
                let fontSize = $('#option_display_font_size_text')[0].value;
                // console.log(fontSize);

                // assign bounds
                const lowerFontSizeBound = 8;
                const upperFontSizeBound = 25;

                // bound the font size
                if (fontSize < lowerFontSizeBound) {
                    fontSize = lowerFontSizeBound;
                } else if (fontSize > upperFontSizeBound) {
                    fontSize = upperFontSizeBound;
                }

                // display the new value in case it was changed by bounds
                $('#option_display_font_size_text')[0].value = fontSize;

                // make the changes to font size
                $('html *').css('font-size', `${fontSize}px`);
                draw();

                // save the data in cookie
                // console.log("Stored font size: " + fontSize);
                docCookies.setItem('optionDisplayFontSize', fontSize, Infinity);
            });
        },
    },

    optionDisplayHeightOfAvatarContainer: {
        defaultValue: $('#div1Resize').parent().height() * 0.45,
        onLoad() {
            // get cookie data
            let containerHeight = docCookies.getItem('optionDisplayHeightOfAvatarContainer');

            containerHeight = parseInt(containerHeight);

            // set the height of div 1
            $('#div1Resize').height(containerHeight);
            // Note the following function only adjusts the 2nd div (the div below)
            userOptions.optionDisplayHeightOfAvatarContainer.avatarContainerHeightAdjust();

            // set the value in the users display
            $('#option_display_avatar_container_height_text')[0].value = containerHeight;
        },
        initialiseEventListener() {
            // set up div 1 to be resizable in north and south directions
            $('#div1Resize').resizable({
                handles: 's',
            });
            // on resize of div 1, resize div 2.
            $('#div1Resize').resize(() => {
                // Make the height adjustments
                userOptions.optionDisplayHeightOfAvatarContainer.avatarContainerHeightAdjust();
                // save the new heights
                docCookies.setItem('optionDisplayHeightOfAvatarContainer', $('#div1Resize').height(), Infinity);

                // update the new resizeable heights
                $('#div1Resize').resizable('option', 'minHeight', parseInt($(window).height() * 0.25, 10));
                $('#div1Resize').resizable('option', 'maxHeight', parseInt($(window).height() * 0.66, 10));
            });
            // on whole window resize, resize both divs.
            $(window).resize(() => {
                $('#div1Resize').width($('#div2Resize').parent().width());

                // save the new heights
                docCookies.setItem('optionDisplayHeightOfAvatarContainer', $('#div1Resize').height(), Infinity);
                // Make the height adjustments
                userOptions.optionDisplayHeightOfAvatarContainer.avatarContainerHeightAdjust();

                // update the new resizeable heights
                $('#div1Resize').resizable('option', 'minHeight', parseInt($(window).height() * 0.25, 10));
                $('#div1Resize').resizable('option', 'maxHeight', parseInt($(window).height() * 0.66, 10));
            });


            $('#option_display_avatar_container_height_text').on('change', () => {
                let containerHeight = $('#option_display_avatar_container_height_text')[0].value;
                // console.log(containerHeight);

                // assign bounds
                const lowerBound = parseInt($(window).height() * 0.25, 10);
                const upperBound = parseInt($(window).height() * 0.66, 10);

                // bound the font size
                if (containerHeight < lowerBound) {
                    containerHeight = lowerBound;
                } else if (containerHeight > upperBound) {
                    containerHeight = upperBound;
                }

                // set the height of div 1 first:
                $('#div1Resize').height(containerHeight);

                // save the new heights
                docCookies.setItem('optionDisplayHeightOfAvatarContainer', containerHeight, Infinity);

                // Make the height adjustments to div 2
                userOptions.optionDisplayHeightOfAvatarContainer.avatarContainerHeightAdjust();
            });
        },

        avatarContainerHeightAdjust() {
            $('#div2Resize').height($('#div2Resize').parent().height() - $('#div1Resize').height());

            // extend the tab content to bottom
            extendTabContentToBottomInRoom();
            draw();

            // get cookie data
            const containerHeight = docCookies.getItem('optionDisplayHeightOfAvatarContainer');

            // set the value in the users display
            $('#option_display_avatar_container_height_text')[0].value = containerHeight;
        },
    },

    optionDisplayMaxAvatarHeight: {
        defaultValue: '128',
        onLoad() {
            // get cookie data
            const maxAvatarHeight = docCookies.getItem('optionDisplayMaxAvatarHeight');

            // set the value in the users display
            $('#option_display_max_avatar_height')[0].value = maxAvatarHeight;

            draw();
        },
        initialiseEventListener() {
            $('#option_display_max_avatar_height').on('change', () => {
                let maxAvatarHeight = $('#option_display_max_avatar_height')[0].value;
                // console.log(fontSize);

                // assign bounds
                const lowerBound = 30;
                const upperBound = 128;

                // bound the font size
                if (maxAvatarHeight < lowerBound) {
                    maxAvatarHeight = lowerBound;
                } else if (maxAvatarHeight > upperBound) {
                    maxAvatarHeight = upperBound;
                }

                // display the new value in case it was changed by bounds
                $('#option_display_max_avatar_height')[0].value = maxAvatarHeight;

                draw();

                // save the data in cookie
                docCookies.setItem('optionDisplayMaxAvatarHeight', maxAvatarHeight, Infinity);
            });
        },
    },

    optionDisplayDarkTheme: {
        defaultValue: 'false',
        onLoad() {
            if (docCookies.getItem('optionDisplayDarkTheme') === 'true') {
                // console.log("Load up dark theme is true");
                // update the dark theme if cookie data is true
                updateDarkTheme(true);
                // show its checked on their screen
                $('#option_display_dark_theme')[0].checked = true;
            }
        },
        initialiseEventListener() {
            // dark theme option checkbox event listener
            $('#option_display_dark_theme')[0].addEventListener('click', () => {
                const { checked } = $('#option_display_dark_theme')[0];
                // console.log("dark theme change " + checked);
                // dark theme
                updateDarkTheme(checked);

                // save their option in cookie
                docCookies.setItem('optionDisplayDarkTheme', checked.toString(), Infinity);
            });
        },
    },

    optionDisplayTwoTabs: {
        defaultValue: 'false',
        onLoad() {
            if (docCookies.getItem('optionDisplayTwoTabs') === 'true') {
                updateTwoTabs(true);
                // show its checked on their screen
                $('#option_display_two_tabs')[0].checked = true;
            }
        },
        initialiseEventListener() {
            $('#option_display_two_tabs')[0].addEventListener('click', () => {
                const { checked } = $('#option_display_two_tabs')[0];
                // dark theme
                updateTwoTabs(checked);

                // save their option in cookie
                docCookies.setItem('optionDisplayTwoTabs', checked.toString(), Infinity);
            });
        },
    },

    optionDisplayOriginalAvatars: {
        defaultValue: 'false',
        onLoad() {
            if (docCookies.getItem('optionDisplayOriginalAvatars') === 'true') {
                $('#option_display_original_avatars')[0].checked = true;
            }
        },
        initialiseEventListener() {
            $('#option_display_original_avatars')[0].addEventListener('click', () => {
                const { checked } = $('#option_display_original_avatars')[0];
                draw();

                // save their option in cookie
                docCookies.setItem('optionDisplayOriginalAvatars', checked.toString(), Infinity);
            });
        },
    },

    optionDisplayCompactView: {
        defaultValue: 'true',
        onLoad() {
            if (docCookies.getItem('optionDisplayCompactView') === 'true') {
                $('#option_display_compact_view')[0].checked = true;

                updateCompactView(true);
            } else {
                updateCompactView(false);
            }
        },
        initialiseEventListener() {
            $('#option_display_compact_view')[0].addEventListener('click', () => {
                // when they press it...
                const { checked } = $('#option_display_compact_view')[0];

                updateCompactView(checked);


                // save their option in cookie
                docCookies.setItem('optionDisplayCompactView', checked.toString(), Infinity);
            });
        },
    },

    optionDisplayUseOldGameIcons: {
        defaultValue: 'false',
        onLoad() {
            // check if optionDisplayProposedTeamIcon exists in cookies
            const isOptionExists = docCookies.hasItem('optionDisplayUseOldGameIcons');
            let icon = '';
            // if not, set it
            if (isOptionExists === false) {
                icon = true;
                // save it in cookie
                docCookies.setItem('optionDisplayUseOldGameIcons', false, Infinity);
            } else {
                // else load it
                icon = docCookies.getItem('optionDisplayUseOldGameIcons');
            }

            // set check marks
            if (icon === false || icon === 'false') {
                $('#optionDisplayUseOldGameIcons')[0].checked = false;
            } else if (icon === true || icon === 'true') {
                $('#optionDisplayUseOldGameIcons')[0].checked = true;
            } else {
                icon = true;
                docCookies.setItem('optionDisplayUseOldGameIcons', false, Infinity);
            }

            // update image on load
            updateGunImage(icon);
        },
        initialiseEventListener() {
            $('#optionDisplayUseOldGameIcons')[0].addEventListener('click', () => {
                // when they press it...
                const icon = $('#optionDisplayUseOldGameIcons')[0].checked;

                // save their option in cookie
                docCookies.setItem('optionDisplayUseOldGameIcons', icon, Infinity);
                // update image on click
                updateGunImage(icon);
                // Need to redraw and rescale
                setTimeout(() => {
                    draw();
                }, 1000);
            });
        },
    },

    optionDisplayUseSmallIconsCrownShield: {
        defaultValue: 'false',
        onLoad() {
            // check if optionDisplayProposedTeamIcon exists in cookies
            const isOptionExists = docCookies.hasItem('optionDisplayUseSmallIconsCrownShield');
            // if not, set it
            if (isOptionExists === false) {
                // save it in cookie
                docCookies.setItem('optionDisplayUseSmallIconsCrownShield', false, Infinity);
            }

            const getOption = docCookies.getItem('optionDisplayUseSmallIconsCrownShield');

            // set check marks
            if (getOption === false || getOption === 'false') {
                $('#optionDisplayUseSmallIconsCrownShield')[0].checked = false;
            } else if (getOption === true || getOption === 'true') {
                $('#optionDisplayUseSmallIconsCrownShield')[0].checked = true;
            } else {
                docCookies.setItem('optionDisplayUseSmallIconsCrownShield', false, Infinity);
            }
        },
        initialiseEventListener() {
            $('#optionDisplayUseSmallIconsCrownShield')[0].addEventListener('click', () => {
                // when they press it...
                const newCheck = $('#optionDisplayUseSmallIconsCrownShield')[0].checked;
                // save their option in cookie
                docCookies.setItem('optionDisplayUseSmallIconsCrownShield', newCheck, Infinity);

                // Need to redraw and rescale
                draw();
                draw();
            });
        },
    },

    //---------------------------------------------
    // Sound Notifications
    //---------------------------------------------

    optionNotificationsSoundEnable: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundEnable');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_enable')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_enable')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_enable')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundEnable', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundEnableInGame: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundEnableInGame');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_enable_in_game')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_enable_in_game')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_enable_in_game')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundEnableInGame', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundVolume: {
        defaultValue: '50',
        onLoad() {
            // get cookie data
            const volume = docCookies.getItem('optionNotificationsSoundVolume');

            // set the value in the users display
            $('#option_notifications_sound_volume')[0].value = volume;

            // update the number when slider changes
            const volumeSlider = document.getElementById('option_notifications_sound_volume');
            const volumeDisplay = $('#volumeValue');

            volumeDisplay[0].innerHTML = volumeSlider.value;


            volumeSlider.oninput = function () {
                volumeDisplay[0].innerHTML = volumeSlider.value;
            };
        },
        initialiseEventListener() {
            $('#option_notifications_sound_volume')[0].addEventListener('click', () => {
                const valueToStore = $('#option_notifications_sound_volume')[0].value;
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundVolume', valueToStore, Infinity);
            });
        },
    },


    optionNotificationsSoundPlayersJoiningRoom: {
        defaultValue: 'false',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundPlayersJoiningRoom');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_players_joining_room')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_players_joining_room')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_players_joining_room')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundPlayersJoiningRoom', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundPlayersJoiningGame: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundPlayersJoiningGame');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_players_joining_game')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_players_joining_game')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_players_joining_game')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundPlayersJoiningGame', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundGameStarting: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundGameStarting');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_game_starting')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_game_starting')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_game_starting')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundGameStarting', checked.toString(), Infinity);
            });
        },
    },


    optionNotificationsSoundYourTurn: {
        defaultValue: 'false',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundYourTurn');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_your_turn')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_your_turn')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_your_turn')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundYourTurn', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundGameEnding: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundGameEnding');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_game_ending')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_game_ending')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_game_ending')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundGameEnding', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundBuzz: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundBuzz');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_buzz')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_buzz')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_buzz')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundBuzz', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundLick: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundLick');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_lick')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_lick')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_lick')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundLick', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundPat: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundPat');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_pat')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_pat')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_pat')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundPat', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundPoke: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundPoke');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_poke')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_poke')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_poke')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundPoke', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundPunch: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundPunch');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_punch')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_punch')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_punch')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundPunch', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundSlap: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsSoundSlap');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_sound_slap')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_sound_slap')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_sound_slap')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundSlap', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsSoundBuzzSlapTimeout: {
        defaultValue: '15',
        onLoad() {
            // get cookie data
            const seconds = docCookies.getItem('optionNotificationsSoundBuzzSlapTimeout');

            // set the value in the users display
            $('#option_notifications_buzz_slap_timeout')[0].value = seconds;
        },
        initialiseEventListener() {
            $('#option_notifications_buzz_slap_timeout')[0].addEventListener('click', () => {
                const valueToStore = $('#option_notifications_buzz_slap_timeout')[0].value;
                // save their option in cookie
                docCookies.setItem('optionNotificationsSoundBuzzSlapTimeout', valueToStore, Infinity);
            });
        },
    },

    //---------------------------------------------
    // Desktop notifications
    //---------------------------------------------
    optionNotificationsDesktopEnable: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsDesktopEnable');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_desktop_enable')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_desktop_enable')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_desktop_enable')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsDesktopEnable', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsDesktopPlayersJoiningRoom: {
        defaultValue: 'false',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsDesktopPlayersJoiningRoom');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_desktop_players_joining_room')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_desktop_players_joining_room')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_desktop_players_joining_room')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsDesktopPlayersJoiningRoom', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsDesktopPlayersJoiningGame: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsDesktopPlayersJoiningGame');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_desktop_players_joining_game')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_desktop_players_joining_game')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_desktop_players_joining_game')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsDesktopPlayersJoiningGame', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsDesktopGameStarting: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsDesktopGameStarting');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_desktop_game_starting')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_desktop_game_starting')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_desktop_game_starting')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsDesktopGameStarting', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsDesktopYourTurn: {
        defaultValue: 'false',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsDesktopYourTurn');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_desktop_your_turn')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_desktop_your_turn')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_desktop_your_turn')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsDesktopYourTurn', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsDesktopGameEnding: {
        defaultValue: 'false',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsDesktopGameEnding');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_desktop_game_ending')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_desktop_game_ending')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_desktop_game_ending')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsDesktopGameEnding', checked.toString(), Infinity);
            });
        },
    },

    optionNotificationsDesktopBuzz: {
        defaultValue: 'true',
        onLoad() {
            let checked;
            const savedSetting = docCookies.getItem('optionNotificationsDesktopBuzz');
            if (savedSetting === 'true') {
                checked = true;
            } else if (savedSetting === 'false') {
                checked = false;
            }
            $('#option_notifications_desktop_buzz')[0].checked = checked;
        },
        initialiseEventListener() {
            $('#option_notifications_desktop_buzz')[0].addEventListener('click', () => {
                const { checked } = $('#option_notifications_desktop_buzz')[0];
                // save their option in cookie
                docCookies.setItem('optionNotificationsDesktopBuzz', checked.toString(), Infinity);
            });
        },
    },

};

// run through each userOption load and initialiseEventListener
// create the default values if the cookie doesn't have the option stored.
for (const keys in userOptions) {
    if (userOptions.hasOwnProperty(keys)) {
        // if the option doesnt exist, create default option
        if (docCookies.hasItem(keys) === false) {
            docCookies.setItem(keys, userOptions[keys].defaultValue, Infinity);
        }

        // run the load function for each option
        userOptions[keys].onLoad();
        // run the initialise event listener function for each option
        userOptions[keys].initialiseEventListener();
    }
}


// HIGHLIGHT COLOURS


const defaultColours = [
    '#ff6d6d',
    '#ffff9e',
    '#c5b5ff',
    '#ff9b9b',
    '#9aa888',
    '#96ff96',
    '#72afac',
    '#a8d6ff',
    '#9999ff',
    '#ff93ff',
];

// When document has loaded, reinit the jscolor
$(document).ready(() => {
    // On first run, update the colours

    for (let i = 0; i < 10; i++) {
        if (!docCookies.hasItem(`player${i}HighlightColour`)) {
            docCookies.setItem(`player${i}HighlightColour`, defaultColours[i], Infinity);
        }
        $(`#player${i}HighlightColour`)[0].jscolor.fromString(docCookies.getItem(`player${i}HighlightColour`));
        $(`#player${i}HighlightColour2`)[0].jscolor.fromString(docCookies.getItem(`player${i}HighlightColour`));
    }
});


function update(picker) {
    // picker.attr('col', picker.toHEXString());
    picker.col = picker.toHEXString();
    // console.log(picker.playerColourID);
    // console.log(picker.col);

    docCookies.setItem(`player${picker.playerColourID}HighlightColour`, picker.col, Infinity);

    for (let i = 0; i < 10; i++) {
        $(`#player${i}HighlightColour`)[0].jscolor.fromString(docCookies.getItem(`player${i}HighlightColour`));
        $(`#player${i}HighlightColour2`)[0].jscolor.fromString(docCookies.getItem(`player${i}HighlightColour`));
    }


    // refresh the chat highlight colour at the same time

    const username = getUsernameFromIndex(picker.playerColourID);

    // console.log("Player highlight colour: " + playerHighlightColour);

    // only need to change colour if the user has selected that player's chat.
    if (selectedChat[username] === true) {
        const chatItems = $(`.room-chat-list li span[username='${username}']`);
        const playerHighlightColour = docCookies.getItem(`player${getIndexFromUsername(username)}HighlightColour`);

        chatItems.css('background-color', `${playerHighlightColour}`);
    }

    draw();
}


function updateCompactView(input) {
    if (input === true) {
        $('#tabs1').css('padding-right', '0px');
        $('#tabs2').css('padding-left', '0px');

        $('.well').css('margin-bottom', '0px');
        $('.well').css('margin-top', '0px');
    } else {
        $('#tabs1').css('padding-right', '15px');
        $('#tabs2').css('padding-left', '15px');

        $('.well').css('margin-bottom', '20px');
        $('.well').css('margin-top', '20px');
    }
}

function updateGunImage(input) {
    if (input === false || input === 'false') {
        // when shields are used
        $('.gunImg').attr('src', pics.shieldOrange.path);
    } else if (input === true || input === 'true') {
        // when guns are used
        $('.gunImg').attr('src', pics.gun.path);
    }
    adjustGunPositions();
    draw();
}
