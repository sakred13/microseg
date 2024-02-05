const express = require('express');
const authService = require('../services/authService');
const router = express.Router();

router.post('/api/signup', authService.signup);
router.post('/api/login', authService.login);
router.get('/api/authorizeAdmin', authService.authorizeAdmin);
router.put('/api/setZtMode', authService.setZtMode);

module.exports = router;