const User = require('./../models/userModel');
const { catchAsync } = require('./../utils/catchAsync');
const { NOT_IMPLEMENTED, OK } = require('../utils/httpStatusCodes');

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
};
