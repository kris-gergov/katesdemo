const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const Shift = require('../models/shiftModel');
const User = require('../models/userModel');
const dateToday = require('../utils/dateToday');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.aliasUpcoming = (req, res, next) => {
	const limit = req.query.limit * 1;
	const page = req.query.page * 1;
	req.query = JSON.parse(`{ "date": { "$gt": "${dateToday()}" } }`);
	req.query.limit = limit;
	req.query.page = page;
	next();
};

exports.aliasPast = (req, res, next) => {
	const limit = req.query.limit * 1;
	const page = req.query.page * 1;
	req.query = JSON.parse(`{ "date": { "$lt": "${dateToday()}" } }`);
	req.query.sort = '-date';
	req.query.limit = limit;
	req.query.page = page;
	next();
};

exports.aliasUnpaid = (req, res, next) => {
	const page = req.query.page * 1;
	req.query = JSON.parse(`{ "paid": { "$eq": "false" } }`);
	req.query.page = page;
	next();
};

exports.getSingleShift = catchAsync(async (req, res, next) => {
	// if (req.user.role === 'admin') {
	// 	shift = await Shift.findById(req.params.id).populate('client').populate('cleaner');
	// } else {
	// 	shift = await Shift.findById(req.params.id).populate({
	// 		path: 'client',
	// 		select: 'name address phone',
	// 	});
	// }

	const shift = await Shift.findById(req.params.id).populate('client').populate('cleaner');

	if (!shift) {
		return next(new AppError('No shift found with that ID', 404));
	}
	res.status(200).json({
		status: 'success',
		data: {
			shift: shift,
		},
	});
});

exports.createShift = catchAsync(async (req, res, next) => {
	const newShift = await Shift.create(req.body);
	await User.findByIdAndUpdate(req.body.cleaner, { $push: { shifts: newShift._id } });
	await User.findByIdAndUpdate(req.body.client, { $push: { shifts: newShift._id } });

	res.status(201).json({
		status: 'success',
		data: {
			shift: newShift,
		},
	});
});

exports.getAllShifts = factory.getAll(Shift);

exports.updateShift = factory.updateOne(Shift);

exports.deleteShift = factory.deleteOne(Shift);

exports.getSummary = catchAsync(async (req, res, next) => {
	const { from, to, client, cleaner } = req.body;
	const fromDate = new Date(from);
	const toDate = new Date(to);
	let { field } = req.body;
	const summaryField = field.charAt(0).toUpperCase() + field.slice(1);
	let clientId;
	let cleanerId;
	let group2;
	let match2;
	let summary2;

	if (client) {
		clientId = ObjectId(client);
	}
	if (cleaner) {
		cleanerId = ObjectId(cleaner);
	}

	const addFields = {
		range: `${fromDate.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		})} - ${toDate.toLocaleDateString('en-GB', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		})}`,
	};

	const project = {
		_id: 0,
	};

	const match = { date: { $gte: fromDate, $lte: toDate } };

	if (cleanerId) match.cleaner = cleanerId;
	if (clientId) match.client = clientId;

	if (field === 'outstanding') {
		match2 = { date: { $gte: fromDate, $lte: toDate } };

		if (cleanerId) match2.cleaner = cleanerId;
		if (clientId) match2.client = clientId;

		match2.paymentMethod = 'cash';

		group2 = {
			_id: null,
			num: { $sum: 1 },
			total: { $sum: `$amount` },
		};

		summary2 = await Shift.aggregate().match(match2).group(group2).addFields(addFields).project(project).exec();

		field = 'commission';
	}

	const group = {
		_id: null,
		num: { $sum: 1 },
		total: { $sum: `$${field}` },
	};

	const summary = await Shift.aggregate().match(match).group(group).addFields(addFields).project(project).exec();

	if (!summary || !summary.length) {
		return res.status(200).json({
			status: 'fail',
		});
	}

	if (summary2) {
		const outstanding = summary[0].total - summary2[0].total;
		summary[0].total = outstanding;
		summary[0].field = summaryField;

		return res.status(200).json({
			status: 'success',
			data: {
				summary: summary[0],
			},
		});
	}

	summary[0].field = summaryField;

	res.status(200).json({
		status: 'success',
		data: {
			summary: summary[0],
		},
	});
});
