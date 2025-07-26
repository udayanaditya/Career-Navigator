const express = require('express');
const { check } = require('express-validator');
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizHistory,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all quizzes
router.get('/', getQuizzes);

// Get single quiz
router.get('/:id', getQuiz);

// Submit quiz answers and get recommendations
router.post(
  '/:id/submit',
  [
    check('answers', 'Answers array is required').isArray({ min: 1 }),
  ],
  submitQuiz
);

// Get user quiz history (authenticated users only)
router.get('/history', protect, getQuizHistory);

// Create new quiz (admin only)
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('type', 'Quiz type is required').isIn(['interests', 'subjects', 'comprehensive']),
    check('questions', 'Questions array is required').isArray({ min: 1 }),
  ],
  protect,
  authorize('admin'),
  createQuiz
);

// Update quiz (admin only)
router.put('/:id', protect, authorize('admin'), updateQuiz);

// Delete quiz (admin only)
router.delete('/:id', protect, authorize('admin'), deleteQuiz);

module.exports = router;