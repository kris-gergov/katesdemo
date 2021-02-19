function dateToday() {
	const timeElapsed = Date.now();
	const today = new Date(timeElapsed).toISOString();
	return today;
}

module.exports = dateToday;
