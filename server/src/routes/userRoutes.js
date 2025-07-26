const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getMe,
  updateDetails,
  updatePassword,
  saveCareer,
  removeCareer,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register user
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
      min: 6,
    }),
  ],
  registerUser
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  loginUser
);

// Get current user
router.get('/me', protect, getMe);

// Update user details
router.put('/updatedetails', protect, updateDetails);

// Update password
router.put(
  '/updatepassword',
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'Please enter a password with 6 or more characters').isLength({
      min: 6,
    }),
  ],
  protect,
  updatePassword
);

// Save career to user's saved list
router.put('/savecareer/:id', protect, saveCareer);

// Remove career from user's saved list
router.put('/removecareer/:id', protect, removeCareer);

module.exports = router;