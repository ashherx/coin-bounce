const { response } = require('express');
const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const blogController = require('../controller/blogController');
const commentController = require('../controller/commentController');
const auth = require('../middleware/auth');
const comment = require('../models/comment');

// testing
router.get('/test', (req, res) => res.json({msg: 'Working'}))

// user 
// instead of writing this whole login of login like "(req, res) => res.json({msg: 'Working'})"
// we will make it naother folder which is controller folder


// register
router.post('/register', authController.register);

//login
router.post('/login', authController.login);

// logout
router.post('/logout', auth, authController.logout);

// refresh
router.get('/refresh', authController.refresh);

// blog
// create
router.post('/blog', auth, blogController.create);

// get all
router.get('/blog/all', auth, blogController.getAll);

// get blog by id
router.get('/blog/:id', auth, blogController.getById);

// update
router.put('/blog', auth, blogController.update);

// delete
router.delete('/blog/:id', auth, blogController.delete);

// comment
// create comment
router.post('/comment', auth, commentController.create);

// get comments by blog id
router.get('/comment/:id', auth, commentController.getById);

// delete comment

module.exports = router;