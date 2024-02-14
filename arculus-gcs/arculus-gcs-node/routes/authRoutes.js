const express = require('express');
const authService = require('../services/authService');
const router = express.Router();

router.post('/api/signup', authService.signup);
router.post('/api/login', authService.login);
router.get('/api/authorizeAdmin', authService.authorizeAdmin);
router.put('/api/setZtMode', authService.setZtMode);
router.get('/api/authenticate', authService.authenticate)
router.get('/api/runExperimentInPod', authService.runExperimentInPod);

module.exports = router;