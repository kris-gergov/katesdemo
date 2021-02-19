const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
	{
		client: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Client is required'],
			index: true,
		},
		cleaner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Cleaner is required'],
			index: true,
		},
		date: {
			type: Date,
			required: [true, 'Date is required'],
		},
		hours: {
			type: Number,
			required: [true, 'Hours is required'],
			min: 0,
			max: 12,
		},
		amount: {
			type: Number,
			required: [true, 'Amount is required'],
			min: [0, 'Amount cannot be below 0'],
		},
		paid: {
			type: Boolean,
			default: false,
		},
		paymentDate: {
			type: Date,
		},
		paymentMethod: {
			type: String,
			enum: ['cash', 'bank'],
			default: 'cash',
		},
		commission: {
			type: Number,
		},
		notes: {
			type: String,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

shiftSchema.virtual('amountPerHour').get(function () {
	return (this.amount / this.hours).toFixed(2) * 1;
});

shiftSchema.virtual('commissionPerHour').get(function () {
	if (this.commission) {
		return this.commission / this.hours;
	}
	return 0;
});

shiftSchema.pre(/^find/, function (next) {
	this.populate({ path: 'client', select: 'name address' });
	this.populate({ path: 'cleaner', select: 'name' });
	next();
});

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;
