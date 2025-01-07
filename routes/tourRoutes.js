const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  checkIncomingReqBody,
} = require('../controllers/tourController');

// Define routes
const tourRouter = express.Router();

// Check if ID is exists in records
tourRouter.param('id', checkID);

// Mount the routes
tourRouter.route('/').get(getAllTours).post(checkIncomingReqBody, createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = tourRouter;
