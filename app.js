//////////////// STATUS CODES AND DEFINITION
// 200 - OK
// 201 - Created
// 204 - No Content
// 500 - Internal Server Error
const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorController = require('./controllers/errorController');

const app = express();

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

app.use(express.json());

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
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);
  next(err);
});

app.use(globalErrorController);
// Handling undefined routes globally. This should be the last place ENDS HERE

module.exports = app;
