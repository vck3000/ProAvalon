function getTimeDiffInString(inputTime) {
	var currentDate = new Date();
	var dateDifference = new Date(currentDate - inputTime);

	//set it to seconds
	var timeSince = (dateDifference / 1000);

	// console.log(timeSince);
	if (timeSince < 60) {
		timeSince = Math.floor(timeSince) + " sec";
	}
	else if (timeSince / 60 < 60) {
		timeSince = Math.floor(timeSince / 60) + " min";
	}
	else if (timeSince / 60 / 60 < 24) {
		timeSince = Math.floor(timeSince / 60 / 60) + " hr";
	}
	else if (timeSince / 60 / 60 / 24 < 30) {
		timeSince = (Math.floor(timeSince / 60 / 60 / 24)) + " day";
	}
	else if (timeSince / 60 / 60 / 24 / 30 < 12) {
		timeSince = (Math.floor(timeSince / 60 / 60 / 24 / 30)) + " mth";
	}
	else {
		timeSince = (Math.floor(timeSince / 60 / 60 / 24 / 30 / 12)) + " yr";
	}

	return timeSince;
}


module.exports = getTimeDiffInString;