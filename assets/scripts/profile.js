const sec = 1000;
const min = sec * 60;
const hour = min * 60;
const day = hour * 24;
const month = day * 30;
const year = month * 12;

let getDatesString = function (time) {
    let varTime = time;
    let str = "";
    let units = {};
    units[year] = "yrs";
    units[month] = "mths";
    units[day] = "days";
    units[hour] = "hrs";
    units[min] = "mins";
    units[sec] = "secs"
    
    for (let time of [year, month, day, hour, min, sec]) {
        if (Math.floor(varTime/time) !== 0) {
            str += Math.floor(varTime/time) + ` ${units[time]}, `;
            varTime = varTime - Math.floor(varTime/time)*time;
        }
    }
    
    return str.slice(0, -2) + ".";
}

let userData;

$( document ).ready(function () {
    
    $( ".avatarImg" ).hover(function () {
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
    }, function () {
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
    
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
    
    
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","/ajax/profile/getProfileData/" + $("#profileUsername")[0].innerHTML, true);    
    xmlhttp.onreadystatechange=function () {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            userData = JSON.parse(xmlhttp.responseText);
            if (!userData.hideStats) {
                drawCharts();
            }
            
        }
    }
    xmlhttp.send();
});

function drawCharts() {
    
    const allianceOfRole = {
        "Merlin": "Resistance",
        "Percival": "Resistance",
        "Assassin": "Spy",
        "Morgana": "Spy",
        "Mordred": "Spy",
        "Oberon": "Spy",
        "Resistance": "Resistance",
        "Spy": "Spy",
        "Tristan": "Resistance",
        "Isolde": "Resistance"
    }
    
    let blue1 = 'rgba(54, 162, 235, 0.3)';
    let blue2 = 'rgba(54, 162, 235, 0.5)';
    let blueBorder = 'rgba(54, 162, 235, 1)';
    
    let red1 = 'rgba(255, 99, 132, 0.3)';
    let red2 = 'rgba(255, 99, 132, 0.5)';
    let redBorder = 'rgba(255, 99, 132, 1)';
    
    let roleStats = userData.roleStats;
    //collect the total wins and losses of each role and of each game size played
    let generalRoleStats = {};
    for (let gameSize in roleStats) {
        if (roleStats.hasOwnProperty(gameSize)) {
            
            for (let role in roleStats[gameSize]) {
                if (roleStats[gameSize].hasOwnProperty(role)) {
                    if (!generalRoleStats[role]) {
                        generalRoleStats[role] = {
                            wins: 0,
                            losses: 0
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
    
    let spyWins = userData.totalWins - userData.totalResWins;
    let spyLosses = userData.totalLosses - userData.totalResLosses;
    
    //create array for the chartjs hover stats:
    //first two entries are overall res and overall spy
    let generalRoleStatsArray = [
        {
            wins: userData.totalResWins,
            losses: userData.totalResLosses
        },
        {
            wins: spyWins,
            losses: spyLosses
        }
    ];
    i = 2;
    for (let key in generalRoleStats) {
        if (generalRoleStats.hasOwnProperty(key)) {
            generalRoleStatsArray[i] = generalRoleStats[key];
            i++;
        }
    }
    
    let generalLabelsArray = ["Overall Resistance", "Overall Spy"];
    
    let generalData = [Math.floor(userData.totalResWins/ (userData.totalResWins+userData.totalResLosses) * 100), Math.floor((spyWins) / (spyLosses + spyWins) * 100)];
    let backgroundColor = [blue1, red1];
    let borderColor = [blueBorder, redBorder];
    
    for (let role in generalRoleStats) {
        if (generalRoleStats.hasOwnProperty(role)) {
            if (isNaN(generalRoleStats[role].losses) || generalRoleStats[role].losses === null) {
                generalRoleStats[role].losses = 0;
            }
            
            if (isNaN(generalRoleStats[role].wins) || generalRoleStats[role].wins === null) {
                generalRoleStats[role].wins = 0;
            }
            
            let percentWon = Math.floor((generalRoleStats[role].wins / (generalRoleStats[role].wins + generalRoleStats[role].losses)) * 100);
            generalData.push(percentWon);
            
            let role = capitalizeFirstLetter(role);
            generalLabelsArray.push(role);
            
            if (allianceOfRole[role] === "Resistance") {
                backgroundColor.push(blue1);
                borderColor.push(blueBorder);  
            }
            else {
                borderColor.push(redBorder);
                backgroundColor.push(red1);  
            }
        }
    }
    
    let dataGeneral = {
        labels: generalLabelsArray,
        datasets: [{
            label: 'Winrate',
            data: generalData,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1
        }],
    };
    
    let optionsGeneral = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true,
                    
                }
            }],
            xAxes: [{
                ticks: {
                    suggestedMin: 0,
                    suggestedMax: 100,
                    
                    callback: function (value, index, values) {
                        return value + '%';
                    }
                }
            }]
        },
        
        //give back % and also num of games on hover
        tooltips: {
            callbacks: {
                label: function (tooltipItem, chartData) {
                    // return "lmao";
                    return chartData.labels[tooltipItem.index] + ': ' + chartData.datasets[0].data[tooltipItem.index] + '%' + " " + "[" + generalRoleStatsArray[tooltipItem.index].wins + "W/" + generalRoleStatsArray[tooltipItem.index].losses + "L]";                    
                }
            }
        },
    };
    
    let dataSample = {
        labels: ["Resistance", "Spy", "Merlin", "Percival", "Assassin", "Morgana"],
        datasets: [{
            label: 'Winrate %',
            data: [54, 67, 45, 70, 45, 30],
            backgroundColor: [
                blue1,
                blue2,
                red1,
                red2,
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                blueBorder,
                blueBorder,
                redBorder,
                redBorder,
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    }
    
    let ctx = document.getElementById("statsChart");
    let myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: dataGeneral,
        options: optionsGeneral
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
