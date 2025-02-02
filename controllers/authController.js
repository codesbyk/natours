const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const {
  BAD_REQUEST,
  CREATED,
  OK,
  UNAUTHORIZED,
  NOT_FOUND,
  FORBIDDEN,
  INTERNAL_SERVER,
} = require('../utils/httpStatusCodes');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  res.status(CREATED).json({
    status: 'success',
    message: 'User created successfully',
    token,
    data: { user: newUser },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //   1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', BAD_REQUEST));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password');

  console.log(user);
  if (!user) {
    return next(new AppError('Email not exist', NOT_FOUND));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid password', UNAUTHORIZED));
  }

  // 3) If everything is ok, send token to client
  const token = signToken(user._id);
  res.status(OK).json({
    status: 'success',
    message: 'Logged in successfully',
    token,
  });
});

const protect = catchAsync(async (req, res, next) => {
  // 1) Get/Retrive token from client and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login again.', UNAUTHORIZED),
    );
  }

  // 2) Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded, 'DD');

  // 3) Check if the user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('User no longer exists', NOT_FOUND));
  }

  // 4) Check if the user changed password after token is issues
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('Password has changed. Please login again', UNAUTHORIZED),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = freshUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to access this route',
          FORBIDDEN,
        ),
      );
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on end user email provided
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    return next(new AppError('No user found with that email', NOT_FOUND));
  }

  // 2) Generate a random token (NOT A JWT Token)
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send an email to the user with the token
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Please click on this link to reset your password: ${resetURL}. This link will expire in 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (Valid for 10 min)',
      message,
    });

    res.status(OK).json({
      status: 'success',
      message: 'Reset password email sent successfully',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error sending email', INTERNAL_SERVER));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hasedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hasedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired and there is a user
  if (!user) {
    return next(new AppError('Token is invalid or has expired', BAD_REQUEST));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  const token = signToken(user._id);
  res.status(OK).json({
    status: 'success',
    message: 'Password reset successfully',
    token,
    data: {
      user,
    },
  });
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from the collection
  const user = await User.findById(req.user._id).select('+password');

  // 2) check if posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Incorrect current password', UNAUTHORIZED));
  }

  // 3) If so, update passoword
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  // Inorder to work model validators we need to use only .save() method
  await user.save();

  // Log user in, send JWT
  const token = signToken(user._id);
  res.status(OK).json({
    status: 'success',
    message: 'Password updated successfully',
    token,
  });
});

module.exports = {
  signUp,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
