const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'The name is required'],
	},
	email: {
		type: String,
		required: [true, 'The email field is required'],
		unqiue: true,
		validate: [validator.isEmail, 'Please provide a valid email'],
	},
	phone: {
		type: Number,
		minlength: 0,
	},
	address: {
		street: { type: String },
		city: { type: String },
		postcode: { type: String },
	},
	deposit: {
		type: String,
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
		minlength: 8,
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		validate: {
			// Only works on save() OR create() - not on update()
			validator: function (el) {
				return el === this.password; // Checks for matching passwords
			},
			message: 'Passwords must match',
		},
		select: false,
	},
	passwordChangedAt: {
		type: Date,
	},
	passwordResetToken: {
		type: String,
	},
	passwordResetExpires: {
		type: Date,
	},
	role: {
		type: String,
		default: 'client',
		enum: ['client', 'cleaner', 'admin'],
	},
	active: {
		type: Boolean,
		default: true,
		select: false,
	},
	shifts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Shift',
		},
	],
});

userSchema.pre('save', async function (next) {
	// Return if the password has not been modified
	if (!this.isModified('password')) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});

userSchema.pre('save', function (next) {
	// Check if password has been modified or if the user is being created (not updated)
	if (!this.isModified('password') || this.isNew) {
		return next();
	}
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

userSchema.pre(/^find/, function (next) {
	// Only find active accounts (not deleted ones)
	this.find({ active: { $ne: false } });
	next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JwtTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return JwtTimestamp < changedTimestamp;
	}
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex'); // Create random string
	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // Encrypt and store in database for later comparison
	this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // Current date plus 30 minutes

	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
