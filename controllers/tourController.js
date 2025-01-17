const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      requestedAt: req.timestamp,
      message: 'Get All Tours Here....',
      data: {
        tours,
      },
    });
  } catch (err) {
    console.log(err, 'This is an error');
    res.status(404).json({
      status: 'Error',
      message: 'Invalid Data',
      error: err,
    });
  }
};

const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Tour not found' });
    }

    res.status(200).json({
      status: 'Success',
      requestedAt: req.timestamp,
      message: 'Get Tour Here....',
      data: {
        tour,
      },
    });
  } catch (err) {
    console.log(err, 'This is an error');
    res.status(400).json({
      status: 'Error',
      message: 'Invalid Data',
      error: err,
    });
  }
};

const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'Success',
      message: 'Created a Tour Here....',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.log(err, 'This is an error');
    res.status(400).json({
      status: 'Error',
      message: 'Invalid Data',
      error: err,
    });
  }
};

const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (err) {
    console.log(err, 'This is an error');
    res.status(400).json({
      status: 'Error',
      message: 'Invalid Data',
      error: err,
    });
  }
};

const deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'Success',
      data: null,
    });
  } catch (err) {
    console.log(err, 'This is an error');
    res.status(400).json({
      status: 'Error',
      message: 'Invalid Data',
      error: err,
    });
  }
};

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
};
