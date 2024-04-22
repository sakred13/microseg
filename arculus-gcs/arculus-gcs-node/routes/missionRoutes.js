const express = require('express');
const missionService = require('../services/missionService');
const router = express.Router();

router.post('/startMission', missionService.startMission);
router.get('/getMissionState', missionService.getMissionState);
router.post('/createMission', missionService.createMission);
router.get('/getMissionById/:missionId', missionService.getMissionById);
router.get('/getMissionsByCreatorId', missionService.getMissionsByCreatorId);
router.get('/getMissionsBySupervisorId', missionService.getMissionsBySupervisorId);
router.get('/getMissionsByViewerId', missionService.getMissionsByViewerId);
router.put('/updateMission', missionService.updateMission);
router.delete('/deleteMission', missionService.deleteMission);
router.get('getMissionState', missionService.getMissionState);
router.post('/executeStealthyReconAndResupply', missionService.executeStealthyReconAndResupply);
router.post('/simulateBadNetwork', missionService.simulateBadNetwork);

module.exports = router;