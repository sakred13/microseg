const express = require('express');
const missionService = require('../services/missionService');
const router = express.Router();

router.post('/startMission', missionService.startMission);
router.get('/getMissionState', missionService.getMissionState);

module.exports = router;