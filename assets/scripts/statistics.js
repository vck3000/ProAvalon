let gameRecordsData;

$(document).ready(() => {
    $(() => {
        $("[data-toggle=\"tooltip\"]").tooltip();
    });

    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "/ajax/getStatistics", true);

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            console.log(xmlhttp.responseText);
            gameRecordsData = JSON.parse(xmlhttp.responseText);
            console.log(gameRecordsData);

            drawData();
        }
    };
    xmlhttp.send();
});

let grd;
function drawData() {
    grd = gameRecordsData;
    $("#loading").addClass("hidden");
    $("#statsDiv").removeClass("hidden");

    $("#timeCreated")[0].innerText = new Date(grd.timeCreated).toString();

    //* **********************************
    // Site traffic stats
    //* **********************************

    // Convert millis from epoch to a date object for use in the graph.
    const gamesPlayedXAxis = [];
    for (let i = 0; i < grd.siteTrafficGamesPlayedXAxis.length; i++) {
        gamesPlayedXAxis[i] = moment(grd.siteTrafficGamesPlayedXAxis[i], "x").format("DD MMM YYYY hh:mm a"); // parse string
        // console.log(typeof(grd.siteTrafficGamesPlayedXAxis[i]));
    }

    const gamesPlayedStatsConfig = {
        type: "line",
        data: {
            labels: gamesPlayedXAxis,
            datasets: [{
                label: "Games Played per day",
                backgroundColor: "rgba(255, 102, 102, 0.4)",
                borderColor: "rgba(255, 102, 102, 1)",
                data: grd.siteTrafficGamesPlayedYAxis,
                fill: false,
                lineTension: 0,
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            title: {
                display: true,
                text: "Site traffic data",
            },
            tooltips: {
                mode: "index",
                intersect: false,
            },
            hover: {
                mode: "nearest",
                intersect: true,
            },
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        // format: timeFormat,
                        // round: 'day'
                        tooltipFormat: "ddd, ll",
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Date",
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Games Played",
                    },
                    ticks: {
                        beginAtZero: true,
                    },
                }],
            },
        },
    };

    const ctx = document.getElementById("gamesPlayedChart");
    const myChart = new Chart(ctx, gamesPlayedStatsConfig);

    //* **********************************
    // General stats
    //* **********************************
    const resWinPercent = Math.round(grd.totalResWins / grd.totalgamesplayed * 100);
    const spyWinPercent = Math.round(grd.totalSpyWins / grd.totalgamesplayed * 100);
    $("#totalgamesplayed")[0].innerText = `${grd.totalgamesplayed} games`;
    $("#totalreswins")[0].innerText = `${grd.totalResWins} games, ${resWinPercent}%`;
    $("#totalspywins")[0].innerText = `${grd.totalSpyWins} games, ${spyWinPercent}%`;
    $("#averagegameduration")[0].innerText = `${new Date(grd.averageGameDuration).getUTCMinutes()} mins ${new Date(grd.averageGameDuration).getUTCSeconds()} seconds`;

    //* **********************************
    // Game size win rate breakdown stats
    //* **********************************
    $("#5preswin")[0].innerText = `${grd.gameSizeWins[5].res} wins, ${Math.round(grd.gameSizeWins[5].res / (grd.gameSizeWins[5].res + grd.gameSizeWins[5].spy) * 100)}%`;
    $("#5pspywin")[0].innerText = `${grd.gameSizeWins[5].spy} wins, ${Math.round(grd.gameSizeWins[5].spy / (grd.gameSizeWins[5].res + grd.gameSizeWins[5].spy) * 100)}%`;

    $("#6preswin")[0].innerText = `${grd.gameSizeWins[6].res} wins, ${Math.round(grd.gameSizeWins[6].res / (grd.gameSizeWins[6].res + grd.gameSizeWins[6].spy) * 100)}%`;
    $("#6pspywin")[0].innerText = `${grd.gameSizeWins[6].spy} wins, ${Math.round(grd.gameSizeWins[6].spy / (grd.gameSizeWins[6].res + grd.gameSizeWins[6].spy) * 100)}%`;

    $("#7preswin")[0].innerText = `${grd.gameSizeWins[7].res} wins, ${Math.round(grd.gameSizeWins[7].res / (grd.gameSizeWins[7].res + grd.gameSizeWins[7].spy) * 100)}%`;
    $("#7pspywin")[0].innerText = `${grd.gameSizeWins[7].spy} wins, ${Math.round(grd.gameSizeWins[7].spy / (grd.gameSizeWins[7].res + grd.gameSizeWins[7].spy) * 100)}%`;

    $("#8preswin")[0].innerText = `${grd.gameSizeWins[8].res} wins, ${Math.round(grd.gameSizeWins[8].res / (grd.gameSizeWins[8].res + grd.gameSizeWins[8].spy) * 100)}%`;
    $("#8pspywin")[0].innerText = `${grd.gameSizeWins[8].spy} wins, ${Math.round(grd.gameSizeWins[8].spy / (grd.gameSizeWins[8].res + grd.gameSizeWins[8].spy) * 100)}%`;

    $("#9preswin")[0].innerText = `${grd.gameSizeWins[9].res} wins, ${Math.round(grd.gameSizeWins[9].res / (grd.gameSizeWins[9].res + grd.gameSizeWins[9].spy) * 100)}%`;
    $("#9pspywin")[0].innerText = `${grd.gameSizeWins[9].spy} wins, ${Math.round(grd.gameSizeWins[9].spy / (grd.gameSizeWins[9].res + grd.gameSizeWins[9].spy) * 100)}%`;

    $("#10preswin")[0].innerText = `${grd.gameSizeWins[10].res} wins, ${Math.round(grd.gameSizeWins[10].res / (grd.gameSizeWins[10].res + grd.gameSizeWins[10].spy) * 100)}%`;
    $("#10pspywin")[0].innerText = `${grd.gameSizeWins[10].spy} wins, ${Math.round(grd.gameSizeWins[10].spy / (grd.gameSizeWins[10].res + grd.gameSizeWins[10].spy) * 100)}%`;

    //* **********************************
    // Assassination stats
    //* **********************************
    const totalAssassinShots = grd.assassinRolesShot.Merlin
    + grd.assassinRolesShot.Percival
    + grd.assassinRolesShot.Resistance;

    $("#totalMerlinShot")[0].innerText = `${grd.assassinRolesShot.Merlin} times, ${Math.round(grd.assassinRolesShot.Merlin / totalAssassinShots * 100)}%`;
    $("#totalPercivalShot")[0].innerText = `${grd.assassinRolesShot.Percival} times, ${Math.round(grd.assassinRolesShot.Percival / totalAssassinShots * 100)}%`;
    $("#totalResistanceShot")[0].innerText = `${grd.assassinRolesShot.Resistance} times, ${Math.round(grd.assassinRolesShot.Resistance / totalAssassinShots * 100)}%`;

    $("#averageassassinationduration")[0].innerText = `${new Date(grd.averageAssassinationDuration).getUTCMinutes()} mins ${new Date(grd.averageAssassinationDuration).getUTCSeconds()} seconds`;

    //* **********************************
    // Spy wins breakdown
    //* **********************************
    $("#spywinfailingmissions")[0].innerText = `${grd.spyWinBreakdown["Mission fails."]} times, ${Math.round(grd.spyWinBreakdown["Mission fails."] / grd.totalSpyWins * 100)}%`;
    $("#spywinassassinatingmerlin")[0].innerText = `${grd.spyWinBreakdown["Assassinated Merlin correctly."]} times, ${Math.round(grd.spyWinBreakdown["Assassinated Merlin correctly."] / grd.totalSpyWins * 100)}%`;
    $("#spywinhammerreject")[0].innerText = `${grd.spyWinBreakdown["Hammer rejected."]} times, ${Math.round(grd.spyWinBreakdown["Hammer rejected."] / grd.totalSpyWins * 100)}%`;

    //* **********************************
    // Lady of the lake wins breakdown
    //* **********************************
    $("#resStartResWin")[0].innerText = `${grd.ladyBreakdown.resStart.resWin} times, ${Math.round(grd.ladyBreakdown.resStart.resWin / (grd.ladyBreakdown.resStart.resWin + grd.ladyBreakdown.resStart.spyWin) * 100)}%`;
    $("#resStartSpyWin")[0].innerText = `${grd.ladyBreakdown.resStart.spyWin} times, ${Math.round(grd.ladyBreakdown.resStart.spyWin / (grd.ladyBreakdown.resStart.resWin + grd.ladyBreakdown.resStart.spyWin) * 100)}%`;

    $("#spyStartResWin")[0].innerText = `${grd.ladyBreakdown.spyStart.resWin} times, ${Math.round(grd.ladyBreakdown.spyStart.resWin / (grd.ladyBreakdown.spyStart.resWin + grd.ladyBreakdown.spyStart.spyWin) * 100)}%`;
    $("#spyStartSpyWin")[0].innerText = `${grd.ladyBreakdown.spyStart.spyWin} times, ${Math.round(grd.ladyBreakdown.spyStart.spyWin / (grd.ladyBreakdown.spyStart.resWin + grd.ladyBreakdown.spyStart.spyWin) * 100)}%`;

    //* **********************************
    // Game duration by size breakdown
    //* **********************************
    $("#averagegameduration")[0].innerText = `${new Date(grd.averageGameDuration).getUTCMinutes()} mins ${new Date(grd["5paverageGameDuration"]).getUTCSeconds()} seconds`;
    for (let i = 5; i <= 10; i++) $(`#${i}paveragegameduration`)[0].innerText = `${new Date(grd[`${i}paverageGameDuration`]).getUTCMinutes()} mins ${new Date(grd[`${i}paverageGameDuration`]).getUTCSeconds()} seconds`;

    // $("#testDiv")[0].innerText = JSON.stringify(grd);
}
