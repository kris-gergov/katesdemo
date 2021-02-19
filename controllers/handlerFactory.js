const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = Model =>
	catchAsync(async (req, res, next) => {
		// BUILD QUERY
		const features = new APIFeatures(Model.find(), req.query).filter().sort().limitFields().paginate();

		// EXECUTE QUERY
		const docs = await features.query;

		res.status(200).json({
			status: 'success',
			data: {
				docs: docs,
			},
		});
	});

exports.getOne = (Model, populateOptions) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (populateOptions) {
			query = query.populate(populateOptions);
		}
		const document = await query;
		if (!document) {
			return next(new AppError('No document found with that ID', 404));
		}
		res.status(200).json({
			status: 'success',
			data: {
				document: document,
			},
		});
	});

exports.updateOne = Model =>
	catchAsync(async (req, res, next) => {
		const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!document) {
			return next(new AppError('No document found with that ID', 404));
		}
		res.status(200).json({
			status: 'success',
			data: {
				document: document,
			},
		});
	});

exports.deleteOne = Model =>
	catchAsync(async (req, res, next) => {
		const document = await Model.findByIdAndDelete(req.params.id);
		if (!document) {
			return next(new AppError('No document found with that ID', 404));
		}
		res.status(204).json({
			status: 'success',
			data: null,
		});
	});
