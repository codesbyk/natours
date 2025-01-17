const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
} = require('../controllers/tourController');

// Define routes
const tourRouter = express.Router();

// Check if ID is exists in records
// tourRouter.param('id', checkID);

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);

// Mount the routes
tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = tourRouter;
