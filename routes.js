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

// Route that returnsfrom authenticate
router.get('/users', authUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;
  res.json({
    id: user.id,
    firstName: usern.firstName,
    lastName: user.lastName,
    email: user.emailAddress
  });
}));

  //let users = await User.findAll();
  //res.json(users);
//}));

router.get('/courses', asyncHandler(async (req, res) => {
  let courses = await Course.findAll();
  res.json(courses);
}));

router.get('/courses/:id', asyncHandler(async (req, res) => {
  let course = await Course.findByPk(req.params.id);
  if (course){
    res.json(course);
  } else {
        res.status(404).json({message: "Course not found."});
    }
}));


////ADD COURSE POST
router.post('/courses', asyncHandler( async (req, res, next)=>{
    try{
      const course = await Course.create(req.body);
      res.status(201).location(`/courses/${course.id}`).json({ "message": "Account successfully created!" }).end();

    } catch (error){
      res.status(400).json({message: "Course Title and Description required."});
    }
}));

// Send a PUT request to /couse/:id to UPDATE (edit) a quote
router.put('/courses/:id', asyncHandler(async(req,res) => {
    const course = await Course.findByPk(req.params.id);
    if(course){
        await course.update(req.body);
        res.status(204).end();
    } else {
        res.status(404).json({message: "Course Not Found"});
    }
}));

//DELETE COURSE - ADD USER AUTH
router.delete("/courses/:id", asyncHandler(async(req,res, next) => {
    const course = await Course.findByPk(req.params.id);
    await course.destroy(course);
    res.status(204).end();
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
