const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedCareers',
      select: 'title description categories',
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Update user details
// @route   PUT /api/users/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Update password
// @route   PUT /api/users/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'Password is incorrect',
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Save career to user's saved list
// @route   PUT /api/users/savecareer/:id
// @access  Private
exports.saveCareer = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const careerId = req.params.id;

    // Check if career is already saved
    if (user.savedCareers.includes(careerId)) {
      return res.status(400).json({
        success: false,
        error: 'Career already saved',
      });
    }

    user.savedCareers.push(careerId);
    await user.save();

    res.status(200).json({
      success: true,
      data: user.savedCareers,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Remove career from user's saved list
// @route   PUT /api/users/removecareer/:id
// @access  Private
exports.removeCareer = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const careerId = req.params.id;

    // Check if career is saved
    if (!user.savedCareers.includes(careerId)) {
      return res.status(400).json({
        success: false,
        error: 'Career not in saved list',
      });
    }

    user.savedCareers = user.savedCareers.filter(
      (id) => id.toString() !== careerId
    );
    await user.save();

    res.status(200).json({
      success: true,
      data: user.savedCareers,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).json({
    success: true,
    token,
  });
};