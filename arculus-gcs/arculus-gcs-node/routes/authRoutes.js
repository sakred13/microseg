const express = require('express');
const authService = require('../services/authService');
const router = express.Router();

router.post('/signup', authService.signup);
router.post('/login', authService.login);
router.get('/authorize', authService.authorize);
router.put('/setZtMode', authService.setZtMode);
router.get('/authenticate', authService.authenticate)
router.get('/runExperimentInPod', authService.runExperimentInPod);

module.exports = router;