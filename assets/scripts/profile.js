const sec = 1000;
const min = sec * 60;
const hour = min * 60;
const day = hour * 24;
const month = day * 30;
const year = month * 12;

const getDatesString = function (time) {
    let varTime = time;
    let str = "";
    const units = {};
    units[year] = "yrs";
    units[month] = "mths";
    units[day] = "days";
    units[hour] = "hrs";
    units[min] = "mins";
    units[sec] = "secs";

    for (const time of [year, month, day, hour, min, sec]) {
        if (Math.floor(varTime / time) !== 0) {
            str += `${Math.floor(varTime / time)} ${units[time]}, `;
            varTime -= Math.floor(varTime / time) * time;
        }
    }

    return `${str.slice(0, -2)}.`;
};

let userData;

$(document).ready(() => {
    $(".avatarImg").hover(() => {
        let str = "";
        if (userData.avatarImgSpy) {
            if (userData.avatarImgSpy.includes("http")) {
                str = "<%=userData.avatarImgSpy%>";
            } else {
                str = "../avatars/<%=userData.avatarImgSpy%>";
            }
        } else {
            str = "../avatars/base-spy.png";
        }
        $(".avatarImg").attr("src", str);
    }, () => {
        let str = "";
        if (userData.avatarImgRes) {
            if (userData.avatarImgRes.includes("http")) {
                str = "<%=userData.avatarImgRes%>";
            } else {
                str = "../avatars/<%=userData.avatarImgRes%>";
            }
        } else {
            str = "../avatars/base-res.png";
        }

        console.log("res");
        $(".avatarImg").attr("src", str);
    });

    $(() => {
        $("[data-toggle=\"tooltip\"]").tooltip();
    });

    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", `/ajax/profile/getProfileData/${$("#profileUsername")[0].innerHTML}`, true);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            userData = JSON.parse(xmlhttp.responseText);
            if (!userData.hideStats) {
                drawCharts();
            }
        }
    };
    xmlhttp.send();
});

function drawCharts() {
    const allianceOfRole = {
        Merlin: "Resistance",
        Percival: "Resistance",
        Assassin: "Spy",
        Morgana: "Spy",
        Mordred: "Spy",
        Oberon: "Spy",
        Resistance: "Resistance",
        Spy: "Spy",
        Tristan: "Resistance",
        Isolde: "Resistance",
    };

    const blue1 = "rgba(54, 162, 235, 0.3)";
    const blue2 = "rgba(54, 162, 235, 0.5)";
    const blueBorder = "rgba(54, 162, 235, 1)";

    const red1 = "rgba(255, 99, 132, 0.3)";
    const red2 = "rgba(255, 99, 132, 0.5)";
    const redBorder = "rgba(255, 99, 132, 1)";

    const { roleStats } = userData;
    // collect the total wins and losses of each role and of each game size played
    const generalRoleStats = {};
    for (const gameSize in roleStats) {
        if (roleStats.hasOwnProperty(gameSize)) {
            for (const role in roleStats[gameSize]) {
                if (roleStats[gameSize].hasOwnProperty(role)) {
                    if (!generalRoleStats[role]) {
                        generalRoleStats[role] = {
                            wins: 0,
                            losses: 0,
                        };
                    }

                    if (!isNaN(roleStats[gameSize][role].wins)) {
                        generalRoleStats[role].wins += roleStats[gameSize][role].wins;
                    }
                    if (!isNaN(roleStats[gameSize][role].losses)) {
                        generalRoleStats[role].losses += roleStats[gameSize][role].losses;
                    }
                }
            }
        }
    }

    const spyWins = userData.totalWins - userData.totalResWins;
    const spyLosses = userData.totalLosses - userData.totalResLosses;

    // create array for the chartjs hover stats:
    // first two entries are overall res and overall spy
    const generalRoleStatsArray = [
        {
            wins: userData.totalResWins,
            losses: userData.totalResLosses,
        },
        {
            wins: spyWins,
            losses: spyLosses,
        },
    ];
    i = 2;
    for (const key in generalRoleStats) {
        if (generalRoleStats.hasOwnProperty(key)) {
            generalRoleStatsArray[i] = generalRoleStats[key];
            i++;
        }
    }

    const generalLabelsArray = ["Overall Resistance", "Overall Spy"];

    const generalData = [Math.floor(userData.totalResWins / (userData.totalResWins + userData.totalResLosses) * 100), Math.floor((spyWins) / (spyLosses + spyWins) * 100)];
    const backgroundColor = [blue1, red1];
    const borderColor = [blueBorder, redBorder];

    for (const role in generalRoleStats) {
        if (generalRoleStats.hasOwnProperty(role)) {
            if (isNaN(generalRoleStats[role].losses) || generalRoleStats[role].losses === null) {
                generalRoleStats[role].losses = 0;
            }

            if (isNaN(generalRoleStats[role].wins) || generalRoleStats[role].wins === null) {
                generalRoleStats[role].wins = 0;
            }

            const percentWon = Math.floor((generalRoleStats[role].wins / (generalRoleStats[role].wins + generalRoleStats[role].losses)) * 100);
            generalData.push(percentWon);

            let capsRole = capitalizeFirstLetter(role);
            generalLabelsArray.push(capsRole);

            if (allianceOfRole[capsR] === "Resistance") {
                backgroundColor.push(blue1);
                borderColor.push(blueBorder);
            } else {
                borderColor.push(redBorder);
                backgroundColor.push(red1);
            }
        }
    }

    const dataGeneral = {
        labels: generalLabelsArray,
        datasets: [{
            label: "Winrate",
            data: generalData,
            backgroundColor,
            borderColor,
            borderWidth: 1,
        }],
    };

    const optionsGeneral = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,

                },
            }],
            xAxes: [{
                ticks: {
                    suggestedMin: 0,
                    suggestedMax: 100,

                    callback(value, index, values) {
                        return `${value}%`;
                    },
                },
            }],
        },

        // give back % and also num of games on hover
        tooltips: {
            callbacks: {
                label(tooltipItem, chartData) {
                    // return "lmao";
                    return `${chartData.labels[tooltipItem.index]}: ${chartData.datasets[0].data[tooltipItem.index]}%` + " " + `[${generalRoleStatsArray[tooltipItem.index].wins}W/${generalRoleStatsArray[tooltipItem.index].losses}L]`;
                },
            },
        },
    };

    const dataSample = {
        labels: ["Resistance", "Spy", "Merlin", "Percival", "Assassin", "Morgana"],
        datasets: [{
            label: "Winrate %",
            data: [54, 67, 45, 70, 45, 30],
            backgroundColor: [
                blue1,
                blue2,
                red1,
                red2,
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
                blueBorder,
                blueBorder,
                redBorder,
                redBorder,
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
        }],
    };

    const ctx = document.getElementById("statsChart");
    const myChart = new Chart(ctx, {
        type: "horizontalBar",
        data: dataGeneral,
        options: optionsGeneral,
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
