const Quiz = require('../models/Quiz');
const Career = require('../models/Career');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all quizzes
// @route   GET /api/quiz
// @access  Public
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ active: true }).select('-questions');

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get single quiz
// @route   GET /api/quiz/:id
// @access  Public
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Create new quiz
// @route   POST /api/quiz
// @access  Private/Admin
exports.createQuiz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const quiz = await Quiz.create(req.body);

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quiz/:id
// @access  Private/Admin
exports.updateQuiz = async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quiz/:id
// @access  Private/Admin
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    await quiz.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Submit quiz answers and get career recommendations
// @route   POST /api/quiz/:id/submit
// @access  Public/Private
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      });
    }

    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide answers array',
      });
    }

    // Calculate user interests and subjects based on answers
    const userProfile = calculateUserProfile(quiz, answers);

    // Get career recommendations based on user profile
    const recommendations = await getCareerRecommendations(userProfile);

    // Calculate total score
    const score = answers.reduce((total, answer) => total + answer.value, 0);

    // Save quiz result if user is authenticated
    if (req.user) {
      const quizResult = {
        quizId: quiz._id,
        score,
        recommendations: recommendations.map(rec => ({
          careerId: rec.career._id,
          matchPercentage: rec.matchPercentage
        }))
      };

      await User.findByIdAndUpdate(
        req.user.id,
        { $push: { quizResults: quizResult } },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      data: {
        score,
        userProfile,
        recommendations
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// Helper function to calculate user profile from quiz answers
const calculateUserProfile = (quiz, answers) => {
  const userProfile = {
    interests: {},
    subjects: {}
  };

  // Process each answer
  answers.forEach(answer => {
    const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
    if (!question) return;

    const selectedOption = question.options.find(opt => opt._id.toString() === answer.optionId);
    if (!selectedOption) return;

    // Process interests
    selectedOption.interests.forEach(interest => {
      if (!userProfile.interests[interest.name]) {
        userProfile.interests[interest.name] = 0;
      }
      userProfile.interests[interest.name] += interest.weight;
    });

    // Process subjects
    selectedOption.subjects.forEach(subject => {
      if (!userProfile.subjects[subject.name]) {
        userProfile.subjects[subject.name] = 0;
      }
      userProfile.subjects[subject.name] += subject.weight;
    });
  });

  // Normalize scores
  const normalizeScores = (obj) => {
    const values = Object.values(obj);
    const max = Math.max(...values);
    if (max === 0) return obj;

    Object.keys(obj).forEach(key => {
      obj[key] = (obj[key] / max) * 10; // Scale to 0-10
    });
    return obj;
  };

  userProfile.interests = normalizeScores(userProfile.interests);
  userProfile.subjects = normalizeScores(userProfile.subjects);

  return userProfile;
};

// Helper function to get career recommendations based on user profile
const getCareerRecommendations = async (userProfile) => {
  // Get all careers
  const careers = await Career.find({});

  // Calculate match percentage for each career
  const recommendations = careers.map(career => {
    let interestMatchScore = 0;
    let interestTotalWeight = 0;
    let subjectMatchScore = 0;
    let subjectTotalWeight = 0;

    // Calculate interest match
    career.interests.forEach(careerInterest => {
      const userInterestScore = userProfile.interests[careerInterest.name] || 0;
      interestMatchScore += userInterestScore * careerInterest.relevance;
      interestTotalWeight += careerInterest.relevance * 10; // Max user score is 10
    });

    // Calculate subject match
    career.requirements.subjects.forEach(careerSubject => {
      const userSubjectScore = userProfile.subjects[careerSubject.name] || 0;
      subjectMatchScore += userSubjectScore * careerSubject.importance;
      subjectTotalWeight += careerSubject.importance * 10; // Max user score is 10
    });

    // Calculate overall match percentage
    const interestPercentage = interestTotalWeight > 0 ? (interestMatchScore / interestTotalWeight) * 100 : 0;
    const subjectPercentage = subjectTotalWeight > 0 ? (subjectMatchScore / subjectTotalWeight) * 100 : 0;

    // Weight the importance of interests vs subjects (can be adjusted)
    const interestWeight = 0.6;
    const subjectWeight = 0.4;

    const matchPercentage = (
      interestPercentage * interestWeight +
      subjectPercentage * subjectWeight
    );

    return {
      career,
      matchPercentage: Math.round(matchPercentage),
      interestMatch: Math.round(interestPercentage),
      subjectMatch: Math.round(subjectPercentage)
    };
  });

  // Sort by match percentage (highest first)
  recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Return top 10 recommendations
  return recommendations.slice(0, 10);
};

// @desc    Get user quiz history
// @route   GET /api/quiz/history
// @access  Private
exports.getQuizHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'quizResults.quizId',
        select: 'title type'
      })
      .populate({
        path: 'quizResults.recommendations.careerId',
        select: 'title description categories'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      count: user.quizResults.length,
      data: user.quizResults,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};