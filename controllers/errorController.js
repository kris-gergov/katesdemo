const AppError = require('../utils/appError');

const handleCastError = err => {
	const message = `Invalid ${err.path}: ${err.value}.`;
	return new AppError(message, 400);
};

const handleDuplicateFieldError = err => {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Duplicate field: ${value}. Please use another value`;
	return new AppError(message, 400);
};

const handleValidationError = err => {
	const errors = Object.values(err.errors).map(el => el.message);
	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, 400);
};

const handleJwtError = () => new AppError('Invalid token. Please log in again.', 401);

const handleTokenExpiredError = () => new AppError('Expired token. Please log in again.', 401);

const sendDevError = (err, req, res) => {
	// A) API
	if (req.originalUrl.startsWith('/api')) {
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack,
		});
	}

	// B) RENDERED WEBSITE
	return res.status(err.statusCode).render('error', {
		title: 'Error',
		msg: err.message,
		code: err.statusCode,
	});
};

const sendProductionError = (err, req, res) => {
	// A) API
	if (req.originalUrl.startsWith('/api')) {
		// A) Operational, trusted error: send message to client
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		}
		// B) Programming or other unknown error: don't leak error details
		// 1) Log error
		console.error('ERROR 💥', err);
		// 2) Send generic message
		return res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!',
		});
	}

	// RENDERED WEBSITE
	if (err.isOperational) {
		return res.status(err.statusCode).render('error', {
			title: 'Error',
			msg: err.message,
			code: err.statusCode,
		});
	}

	console.error('ERROR 💥', err);
	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong!',
		msg: 'Please try again later.',
	});
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendDevError(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		if (error.name === 'CastError') {
			error = handleCastError(error);
		}
		if (error.code === 11000) {
			error = handleDuplicateFieldError(error);
		}
		if (error.name === 'ValidationError') {
			error = handleValidationError(error);
		}
		if (error.name === 'JsonWebTokenError') {
			error = handleJwtError();
		}
		if (error.name === 'TokenExpiredError') {
			error = handleTokenExpiredError();
		}
		sendProductionError(err, req, res);
	}
};
