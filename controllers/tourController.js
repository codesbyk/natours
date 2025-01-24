const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const {
  OK,
  NOT_FOUND,
  CREATED,
  NO_CONTENT,
} = require('../utils/httpStatusCodes');

const monthsList = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(OK).json({
    status: 'success',
    results: tours.length,
    requestedAt: req.timestamp,
    message: 'Get All Tours Here....',
    data: {
      tours,
    },
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    const noTourError = new AppError(
      `No Tour found with the ID ${req.params.id}`,
      NOT_FOUND,
    );
    return next(noTourError);
  }

  res.status(OK).json({
    status: 'Success',
    requestedAt: req.timestamp,
    message: 'Get Tour Here....',
    data: {
      tour,
    },
  });
});

const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(CREATED).json({
    status: 'Success',
    message: 'Created a Tour Here....',
    data: {
      tour: newTour,
    },
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    const noTourError = new AppError(
      `No Tour found with the ID ${req.params.id}`,
      NOT_FOUND,
    );
    return next(noTourError);
  }

  res.status(OK).json({
    status: 'Success',
    data: {
      tour,
    },
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    const noTourError = new AppError(
      `No Tour found with the ID ${req.params.id}`,
      NOT_FOUND,
    );
    return next(noTourError);
  }

  res.status(NO_CONTENT).json({
    status: 'Success',
    data: null,
  });
});

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: {
          $toUpper: '$difficulty',
        },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratinsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  res.status(OK).json({
    status: 'Success',
    data: stats,
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year || new Date().getFullYear();

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        // month: '$_id',
        monthName: { $arrayElemAt: [monthsList, { $subtract: ['$_id', 1] }] },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 6,
    },
  ]);

  res.status(200).json({
    status: 'Success',
    result: plan.length,
    data: {
      plan,
    },
  });
});

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
