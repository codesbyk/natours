const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorController = require('./controllers/errorController');

const { NOT_FOUND } = require('./utils/httpStatusCodes');

const app = express();

app.use(helmet());

// Middleware for logging requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use(
    morgan('common', {
      stream: fs.createWriteStream(path.join(__dirname, 'access.dev.log'), {
        flags: 'a',
      }),
    }),
  );
} else {
  app.use(morgan('common'));
  app.use(
    morgan('common', {
      stream: fs.createWriteStream(path.join(__dirname, 'access.prod.log'), {
        flags: 'a',
      }),
    }),
  );
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

app.use(
  express.json({
    limit: '100kb',
  }),
);

// Data Sanitization against NoSQL query Injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'maxGroupSize',
      'difficulty',
    ],
  }),
);

app.use(express.static(`${__dirname}/public}`));

app.use((req, res, next) => {
  console.log('Hello from the middleware....!');
  next();
});

app.use((req, res, next) => {
  req.timestamp = new Date().toISOString();
  req.requestTime = new Date().toISOString();
  req.body.timestamp = new Date().toISOString();
  next();
});

// Use the routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handling undefined routes globally. This should be the last place STARTS HERE
app.all('*', (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server`,
    NOT_FOUND,
  );
  next(err);
});

app.use(globalErrorController);
// Handling undefined routes globally. This should be the last place ENDS HERE

module.exports = app;
