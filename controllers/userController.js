const User = require('./../models/userModel');
const { catchAsync } = require('./../utils/catchAsync');
const {
  NOT_IMPLEMENTED,
  OK,
  BAD_REQUEST,
} = require('../utils/httpStatusCodes');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/////////////////////////////// USERS
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(OK).json({
    status: 'Success',
    results: users.length,
    data: {
      users,
    },
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name', 'email');
  // 1) Create error if user Posts password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError('This route does not allow password updates', BAD_REQUEST),
    );
  }
  // 2) Update user document
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(OK).json({
    status: 'success',
    data: {
      user: user,
    },
  });
});

const createUser = (req, res) => {
  res.status(NOT_IMPLEMENTED).json({
    status: 'Error',
    message: 'This route is not yet defined!',
  });
};

const getUser = (req, res) => {
  res.status(NOT_IMPLEMENTED).json({
    status: 'Error',
    message: 'This route is not yet defined!',
  });
};

const updateUser = (req, res) => {
  res.status(NOT_IMPLEMENTED).json({
    status: 'Error',
    message: 'This route is not yet defined!',
  });
};

const deleteUser = (req, res) => {
  res.status(NOT_IMPLEMENTED).json({
    status: 'Error',
    message: 'This route is not yet defined!',
  });
};

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
};
