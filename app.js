const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const viewRouter = require('./routes/viewRoutes');
const shiftRouter = require('./routes/shiftRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

// GLOBAL MIDDLEWARE

// Static files
app.use(express.static(path.join(__dirname, '/public')));

app.disable('etag');

app.use(cors());

// Security HTTP headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
	max: 500, // 500 requests maximum
	windowMs: 60 * 60 * 1000, // 1 hour in ms
	message: 'Too many requests from this IP. Try again later.',
});
app.use('/api', limiter);

// Body + cookie parser - Data from the body is added to the request
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compresses text sent to clients
app.use(compression());

// ROUTES

app.use('/', viewRouter);
app.use('/api/v1/shifts', shiftRouter);
app.use('/api/v1/users', userRouter);

// 404 route handler
app.all('*', (req, res, next) => {
	next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
