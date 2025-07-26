const express = require('express');
const { check } = require('express-validator');
const {
  getCareers,
  getCareer,
  createCareer,
  updateCareer,
  deleteCareer,
  getCareerCategories,
  getSimilarCareers,
} = require('../controllers/careerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all careers with filtering and pagination
router.get('/', getCareers);

// Get career categories
router.get('/categories', getCareerCategories);

// Get single career
router.get('/:id', getCareer);

// Get similar careers
router.get('/:id/similar', getSimilarCareers);

// Create new career (admin only)
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('categories', 'At least one category is required').isArray({ min: 1 }),
  ],
  protect,
  authorize('admin'),
  createCareer
);

// Update career (admin only)
router.put('/:id', protect, authorize('admin'), updateCareer);

// Delete career (admin only)
router.delete('/:id', protect, authorize('admin'), deleteCareer);

module.exports = router;