const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

// Define routes
const userRouter = express.Router();

// Auth Controller Routes
userRouter.post('/signup', signUp);
userRouter.post('/login', login);

userRouter.post('/forgotPassword', forgotPassword);
userRouter.post('/resetPassword', resetPassword);

// Mount the routes
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
