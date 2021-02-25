const axios = require('axios');

const User = require('../models/userModel');
const Shift = require('../models/shiftModel');
const catchAsync = require('../utils/catchAsync');

exports.home = catchAsync(async (req, res, next) => {
	const upcoming = await axios({
		method: 'GET',
		url: 'https://katesdemo.herokuapp.com/api/v1/shifts/upcoming',
		params: {
			limit: 4,
		},
	});

	const past = await axios({
		method: 'GET',
		url: 'https://katesdemo.herokuapp.com/api/v1/shifts/past',
		params: {
			limit: 4,
		},
	});

	res.status(200).render('index', {
		upcoming_shifts: upcoming.data.data.docs,
		past_shifts: past.data.data.docs,
		user: res.locals.user.name,
	});
});

exports.login = (req, res, next) => {
	res.status(200).render('login', {
		title: 'Login',
	});
};

exports.addShift = catchAsync(async (req, res, next) => {
	const clients = await User.find({ role: 'client' }).select('name');
	const cleaners = await User.find({ role: 'cleaner' }).select('name');
	res.status(200).render('add_shift', {
		title: 'Add a shift',
		clients: clients,
		cleaners: cleaners,
		user: res.locals.user.name,
	});
});

exports.addUser = (req, res, next) => {
	res.status(200).render('add_user', {
		title: `Add a ${req.role}`,
		role: req.role,
		user: res.locals.user.name,
	});
};

exports.getShifts = catchAsync(async (req, res, next) => {
	const response = await axios({
		method: 'GET',
		url: `https://katesdemo.herokuapp.com/api/v1/shifts?page=${req.query.page}`,
	});

	res.status(200).render('shifts', {
		title: 'All shifts',
		shifts: response.data.data.docs,
		page: req.query.page * 1,
		user: res.locals.user.name,
	});
});

exports.upcomingShifts = catchAsync(async (req, res, next) => {
	const response = await axios({
		method: 'GET',
		url: 'https://katesdemo.herokuapp.com/api/v1/shifts/upcoming',
		params: {
			page: req.query.page * 1,
		},
	});

	res.status(200).render('shifts', {
		title: 'Upcoming shifts',
		shifts: response.data.data.docs,
		page: req.query.page * 1,
		url: req._parsedUrl.pathname,
		user: res.locals.user.name,
	});
});

exports.pastShifts = catchAsync(async (req, res, next) => {
	const response = await axios({
		method: 'GET',
		url: 'https://katesdemo.herokuapp.com/api/v1/shifts/past',
		params: {
			page: req.query.page * 1,
		},
	});

	res.status(200).render('shifts', {
		title: 'Past shifts',
		shifts: response.data.data.docs,
		page: req.query.page * 1,
		url: req._parsedUrl.pathname,
		user: res.locals.user.name,
	});
});

exports.unpaidShifts = catchAsync(async (req, res, next) => {
	const response = await axios({
		method: 'GET',
		url: 'https://katesdemo.herokuapp.com/api/v1/shifts/unpaid',
		params: {
			page: req.query.page * 1,
		},
	});

	res.status(200).render('shifts', {
		title: 'Unpaid shifts',
		shifts: response.data.data.docs,
		page: req.query.page * 1,
		url: req._parsedUrl.pathname,
		user: res.locals.user.name,
	});
});

exports.getShift = catchAsync(async (req, res, next) => {
	const response = await axios({
		method: 'GET',
		url: `https://katesdemo.herokuapp.com/api/v1/shifts/${req.params.id}`,
	});

	res.status(200).render('shift', {
		title: 'Single shifts',
		shift: response.data.data.shift,
		user: res.locals.user.name,
	});
});

exports.editShift = catchAsync(async (req, res, next) => {
	const clients = await User.find({ role: 'client' });
	const cleaners = await User.find({ role: 'cleaner' });
	const shift = await Shift.findById(req.params.id);
	const filteredClients = clients.filter(item => item._id.toString() !== shift.client._id.toString());
	const filteredCleaners = cleaners.filter(item => item._id.toString() !== shift.cleaner._id.toString());

	res.status(200).render('edit_shift', {
		title: 'Edit a shift',
		shift: shift,
		clients: filteredClients,
		cleaners: filteredCleaners,
		user: res.locals.user.name,
	});
});

exports.getClients = catchAsync(async (req, res, next) => {
	const response = await axios({
		method: 'GET',
		url: `https://katesdemo.herokuapp.com/api/v1/users/clients?page=${req.query.page}`,
	});

	res.status(200).render('clients', {
		title: 'All clients',
		clients: response.data.data.docs,
		page: req.query.page * 1,
		url: req._parsedUrl.pathname,
		user: res.locals.user.name,
	});
});

exports.getCleaners = catchAsync(async (req, res, next) => {
	const response = await axios({
		method: 'GET',
		url: `https://katesdemo.herokuapp.com/api/v1/users/cleaners?page=${req.query.page}`,
	});

	res.status(200).render('cleaners', {
		title: 'All cleaners',
		cleaners: response.data.data.docs,
		page: req.query.page * 1,
		url: req._parsedUrl.pathname,
		user: res.locals.user.name,
	});
});

exports.getUser = catchAsync(async (req, res, next) => {
	let singleUser = req.user;
	if (req.params.id) {
		const response = await axios({
			method: 'GET',
			url: `https://katesdemo.herokuapp.com/api/v1/users/${req.params.id}`,
		});
		singleUser = response.data.data.document;
	}

	res.status(200).render('user', {
		title: 'Single user',
		singleUser: singleUser,
		user: res.locals.user.name,
	});
});

exports.editUser = catchAsync(async (req, res, next) => {
	const singleUser = await User.findById(req.params.id);

	res.status(200).render('edit_user', {
		title: 'Edit a user',
		singleUser: singleUser,
		user: res.locals.user.name,
	});
});

exports.summary = catchAsync(async (req, res, next) => {
	const clients = await User.find({ role: 'client' }).select('name');
	const cleaners = await User.find({ role: 'cleaner' }).select('name');
	res.status(200).render('summary', {
		title: 'Summary',
		clients: clients,
		cleaners: cleaners,
		user: res.locals.user.name,
	});
});

exports.roleType = role =>
	function (req, res, next) {
		req.role = role;
		next();
	};
