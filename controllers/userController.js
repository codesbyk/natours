const { NOT_IMPLEMENTED } = require('../utils/httpStatusCodes');

/////////////////////////////// USERS
const getAllUsers = (req, res) => {
  res.status(NOT_IMPLEMENTED).json({
    status: 'Error',
    message: 'This route is not yet defined!',
  });
};

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

module.exports = { getAllUsers, createUser, getUser, updateUser, deleteUser };
