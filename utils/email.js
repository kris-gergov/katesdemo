const nodemailer = require('nodemailer');

const sendEmail = async options => {
	// Create transporter
	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
		// Activate less secure app option in gmail
	});

	// Define email options
	const mailOptions = {
		from: 'Kris Gergov <krisgergov@gmail.com>',
		to: options.email,
		subject: options.subject,
		text: options.message,
	};

	// Send email
	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
