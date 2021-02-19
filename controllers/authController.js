const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id =>
	jwt.sign({ id: id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);
	const cookieOptions = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') {
		cookieOptions.secure = true;
	}

	res.cookie('jwt', token, cookieOptions);

	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user,
		},
	});
};

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes(el)) {
			newObj[el] = obj[el];
		}
	});
	return newObj;
};

exports.register = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		address: req.body.address,
		phone: req.body.phone,
		deposit: req.body.deposit,
		role: req.body.role,
	});

	res.status(200).json({
		status: 'success',
		data: {
			newUser,
		},
	});
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new AppError('Email and password are required', 400));
	}

	const user = await User.findOne({ email: email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect email or password', 401));
	}

	createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
	res.cookie('jwt', 'loggedout', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});
	res.status(200).json({ status: 'success' });
});

exports.protect = catchAsync(async (req, res, next) => {
	// Check if token is present
	let token;
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	if (!token) {
		return next(new AppError('You are not logged in.', 401));
	}

	// Verify token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// Check if user still exists
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(new AppError('User no longer exists.', 401));
	}

	// Check if user changed password after the token was issued
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(new AppError('Password was recently changed. Please log in again.', 401));
	}

	// Grant access to protected route
	req.user = currentUser;
	next();
});

// Only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
	// Check if token is valid
	if (req.cookies.jwt) {
		try {
			const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

			// Check if user still exists
			const currentUser = await User.findById(decoded.id);
			if (!currentUser) {
				return next();
			}

			// Check if user changed password after the token was issued
			if (currentUser.changedPasswordAfter(decoded.iat)) {
				return next();
			}

			// There is a logged in user
			res.locals.user = currentUser;
			return next();
		} catch (err) {
			return next();
		}
	}
	next();
};

exports.restrictTo = (...roles) => (req, res, next) => {
	if (!roles.includes(req.user.role)) {
		return next(new AppError('You do not have permission to perform this action.', 403));
	}
	next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// Get user from POSTed email
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError('No user exists with that email address.', 404));
	}

	// Generate random reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	// Build email
	const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
	const message = `Forgot password? Click the link below to reset it: ${resetURL}.`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Forgot password',
			message,
		});

		res.status(200).json({
			status: 'success',
			message: 'Token sent to email',
		});
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(new AppError('Failed sending the email. Try again later.', 500));
	}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	// Get user based on token and checks if passwordReset has expired
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
	const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

	// Check if user is valid
	if (!user) {
		return next(new AppError('Token is invalid or expired.', 400));
	}

	// Set new password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	// Update changedPasswordAt field (done in the model)
	// Log user in, send JWT
	createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	// Get user
	const currentUser = await User.findById(req.user.id).select('+password');

	// Check current password
	if (!currentUser || !(await currentUser.correctPassword(req.body.currentPassword, currentUser.password))) {
		return next(new AppError('Incorrect password', 401));
	}

	// Update password
	currentUser.password = req.body.password;
	currentUser.passwordConfirm = req.body.passwordConfirm;
	currentUser.passwordChangedAt = Date.now() - 1000;
	await currentUser.save();

	// Log user in
	createSendToken(currentUser, 200, res);
});

exports.updateAccount = catchAsync(async (req, res, next) => {
	// Make sure password isn't updated
	if (req.body.password || req.body.passwordConfirm) {
		return next(new AppError('Incorrect route to update password', 400));
	}

	// Update only allowed fields
	const filteredData = filterObj(req.body, 'name', 'email', 'address', 'phone', 'deposit');
	const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredData, { new: true, runValidators: true });

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser,
		},
	});
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.params.id, { active: false });
	res.status(204).json({
		status: 'success',
		data: null,
	});
});
