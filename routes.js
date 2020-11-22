'use strict';

const express = require('express');

// Construct a router instance.
const router = express.Router();
const { User }  = require('./models');
const { Course } = require('./models');
const { authUser } = require('./authenticate');



// Handler function to wrap each route.
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
}

// Route that returns a list of users.
router.get('/users', authUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;

  res.json({
    name: user.name,
    username: user.username,
  });
}));

  //let users = await User.findAll();
  //res.json(users);
//}));

router.get('/courses', asyncHandler(async (req, res) => {
  let courses = await Course.findAll();
  res.json(courses);
}));



// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
  try {
    await User.create(req.body);
    res.status(201).json({ "message": "User successfully created!" });
  } catch (error) {
    console.log('ERROR: ', error.name);

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      throw error;
    }
  }
}));

module.exports = router;
