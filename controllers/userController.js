const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasClients = (req, res, next) => {
	const page = req.query.page * 1;
	req.query = JSON.parse(`{ "role": { "$eq": "client" } }`);
	req.query.sort = 'name';
	req.query.page = page;
	next();
};

exports.aliasCleaners = (req, res, next) => {
	const page = req.query.page * 1;
	req.query = JSON.parse(`{ "role": { "$eq": "cleaner" } }`);
	req.query.sort = 'name';
	req.query.page = page;
	next();
};

exports.getAllUsers = factory.getAll(User);

exports.createUser = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		address: req.body.address,
		phone: req.body.phone,
		role: req.body.role,
	});

	res.status(201).json({
		status: 'success',
		data: {
			user: newUser,
		},
	});
});

exports.getSingleUser = factory.getOne(User, { path: 'shifts' });

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
