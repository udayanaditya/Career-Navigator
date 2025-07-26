const Career = require('../models/Career');
const { validationResult } = require('express-validator');

// @desc    Get all careers
// @route   GET /api/careers
// @access  Public
exports.getCareers = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      minSalary, 
      maxSalary, 
      outlook,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};

    // Search by title or description
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by category
    if (category) {
      query.categories = category;
    }

    // Filter by salary range
    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.mid = { $gte: parseInt(minSalary) };
      if (maxSalary) query.salary.mid = { ...query.salary.mid, $lte: parseInt(maxSalary) };
    }

    // Filter by job outlook
    if (outlook) {
      query['jobOutlook.outlook'] = outlook;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    let sortOptions = {};
    if (sort) {
      switch (sort) {
        case 'salary-high':
          sortOptions = { 'salary.mid': -1 };
          break;
        case 'salary-low':
          sortOptions = { 'salary.mid': 1 };
          break;
        case 'outlook':
          sortOptions = { 'jobOutlook.growth': -1 };
          break;
        case 'title':
          sortOptions = { title: 1 };
          break;
        default:
          sortOptions = { title: 1 };
      }
    } else {
      sortOptions = { title: 1 };
    }

    // Execute query
    const careers = await Career.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Career.countDocuments(query);

    res.status(200).json({
      success: true,
      count: careers.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: careers,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get single career
// @route   GET /api/careers/:id
// @access  Public
exports.getCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);

    if (!career) {
      return res.status(404).json({
        success: false,
        error: 'Career not found',
      });
    }

    res.status(200).json({
      success: true,
      data: career,
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Career not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Create new career
// @route   POST /api/careers
// @access  Private/Admin
exports.createCareer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const career = await Career.create(req.body);

    res.status(201).json({
      success: true,
      data: career,
    });
  } catch (error) {
    console.error(error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Career with this title already exists',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Update career
// @route   PUT /api/careers/:id
// @access  Private/Admin
exports.updateCareer = async (req, res) => {
  try {
    let career = await Career.findById(req.params.id);

    if (!career) {
      return res.status(404).json({
        success: false,
        error: 'Career not found',
      });
    }

    career = await Career.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: career,
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Career not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Delete career
// @route   DELETE /api/careers/:id
// @access  Private/Admin
exports.deleteCareer = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);

    if (!career) {
      return res.status(404).json({
        success: false,
        error: 'Career not found',
      });
    }

    await career.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Career not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get career categories
// @route   GET /api/careers/categories
// @access  Public
exports.getCareerCategories = async (req, res) => {
  try {
    const categories = await Career.distinct('categories');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// @desc    Get similar careers
// @route   GET /api/careers/:id/similar
// @access  Public
exports.getSimilarCareers = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);

    if (!career) {
      return res.status(404).json({
        success: false,
        error: 'Career not found',
      });
    }

    // Find careers with similar categories or interests
    const similarCareers = await Career.find({
      _id: { $ne: req.params.id },
      $or: [
        { categories: { $in: career.categories } },
        { 'interests.name': { $in: career.interests.map(i => i.name) } },
      ],
    }).limit(5);

    res.status(200).json({
      success: true,
      count: similarCareers.length,
      data: similarCareers,
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Career not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};