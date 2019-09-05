function getTimeDiffInString(inputTime) {
    const currentDate = new Date();
    const dateDifference = new Date(currentDate - inputTime);

    // set it to seconds
    let timeSince = (dateDifference / 1000);

    // console.log(timeSince);
    if (timeSince < 60) {
        timeSince = `${Math.floor(timeSince)} sec`;
    } else if (timeSince / 60 < 60) {
        timeSince = Math.floor(timeSince / 60).toString();
        if (timeSince === '1') {
            timeSince += ' min';
        } else {
            timeSince += ' mins';
        }
    } else if (timeSince / 60 / 60 < 24) {
        timeSince = Math.floor(timeSince / 60 / 60).toString();
        if (timeSince === '1') {
            timeSince += ' hr';
        } else {
            timeSince += ' hrs';
        }
    } else if (timeSince / 60 / 60 / 24 < 30) {
        timeSince = (Math.floor(timeSince / 60 / 60 / 24).toString());
        if (timeSince === '1') {
            timeSince += ' day';
        } else {
            timeSince += ' days';
        }
    } else if (timeSince / 60 / 60 / 24 / 30 < 12) {
        timeSince = (Math.floor(timeSince / 60 / 60 / 24 / 30)).toString();
        if (timeSince === '1') {
            timeSince += ' mth';
        } else {
            timeSince += ' mths';
        }
    } else {
        timeSince = (Math.floor(timeSince / 60 / 60 / 24 / 30 / 12)).toString();
        if (timeSince === '1') {
            timeSince += ' yr';
        } else {
            timeSince += ' yrs';
        }
    }

    return timeSince;
}


module.exports = getTimeDiffInString;
