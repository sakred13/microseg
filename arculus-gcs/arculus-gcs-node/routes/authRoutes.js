const express = require('express');
const authService = require('../services/authService');
const router = express.Router();

router.post('/signup', authService.signup);
router.post('/login', authService.login);
router.get('/authorize', authService.authorize);
router.put('/setZtMode', authService.setZtMode);
router.get('/authenticate', authService.authenticate)
router.get('/runExperimentInPod', authService.runExperimentInPod);
router.post('/sendEmailForAuth', authService.sendEmailForAuth);
router.post('/verifyOtp', authService.verifyOtp);
router.get('/isNewSetup', authService.isNewSetup);

module.exports = router;