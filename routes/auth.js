var express = require('express');
var router = express.Router();

const {login, showLogin, refresh} = require('../controller/authController')

// show login form
router.get('/', showLogin)
router.get('/auth', login)
router.get('/refresh', refresh)

module.exports = router;
