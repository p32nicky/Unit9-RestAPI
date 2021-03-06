'use strict';

const express = require('express');
const router = express.Router();
const { User }  = require('./models');
const { Course } = require('./models');
const { authUser } = require('./authenticate'); //User authentication Middleware
const bcryptjs = require('bcryptjs');
const { check, validationResult } = require('express-validator'); //Checks for inputs on put route

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

// Route that returns users after Authorization
router.get('/users', authUser, asyncHandler(async (req, res) => {
  let users = await User.findAll();
  res.json(users);
}));

//Route Get all courses and include courses model info
router.get('/courses', asyncHandler(async (req, res, next) => {
  let courses = await Course.findAll({ include:[{ model: User, attributes: ['firstName', 'lastName', 'emailAddress', 'id']}]
});
  res.json(courses);
}));

//Route get course by ID and include model course info
router.get('/courses/:id', asyncHandler(async (req, res) => {
  let course = await Course.findByPk(req.params.id, { include:[{ model: User, attributes: ['firstName', 'lastName', 'emailAddress', 'id' ]}]
});
  if (course){
    res.json(course);
  } else {
      res.status(404).json({message: "Course not found."});
  }
}));

//Route post new course and set location
router.post('/courses', authUser, asyncHandler( async (req, res, next)=>{
  try{
    const course = await Course.create(req.body);
    res.status(201).location(`/api/courses/${course.id}`).end();

  }catch (error) {
    console.log('ERROR: ', error.name);

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      throw error;
    }
  }
}));

//Route to send a PUT request to /couse/:id to UPDATE (edit) a course
//Checks title and description are not empty with express validator
router.put('/courses/:id',  [
    check('title').not().isEmpty().withMessage("Title is not long enough"),
    check('description').not().isEmpty().withMessage("Description is not long enough"),
], authUser, asyncHandler(async(req,res, next) => {
  const errors = validationResult(req);
  const course = await Course.findByPk(req.params.id);

//If errors are not empty
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const message = errorArray.map(err => err.message);
    res.status(400).json({errors: errors.array()}).end();
  }

//Success and update
  else {
    course.update(req.body)
    return res.status(204).end();
  }
}));

//Route to delete a course
router.delete("/courses/:id", authUser, asyncHandler(async(req,res, next) => {
    const course = await Course.findByPk(req.params.id);
    await course.destroy(course);
    res.status(204).end();
}));

// Route that creates a new user.
//Checks if req.body has a password and then hashes it and assigns to self
router.post('/users', asyncHandler(async (req, res) => {
  try {
    if(req.body.password){
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
    await User.create(req.body);
    res.status(201).location(`/`).end();

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
