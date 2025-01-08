const checkIncomingReqBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res
      .status(400)
      .json({ status: 'Failed', message: 'Missing required fields' });
  }
  next();
};

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.timestamp,
    message: 'Get All Tours Here....',
  });
};

const getTour = (req, res) => {
  const id = +req.params.id;
  res.status(200).json({
    id,
    status: 'Success',
    message: 'Get Tour Here....',
  });
};

const createTour = (req, res) => {
  res.status(201).json({
    status: 'Success',
    message: 'Create a Tour Here....',
  });
};

const updateTour = (req, res) => {
  res.status(200).json({
    status: 'Success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  res.status(204).json({
    status: 'Success',
    data: null,
  });
};

module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  checkIncomingReqBody,
};
