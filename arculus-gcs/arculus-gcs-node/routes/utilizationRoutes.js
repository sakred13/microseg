// utilizationRoutes.js

const express = require('express');
const router = express.Router();
const utilizationService = require('../services/utilizationService');

// Define the route for getting utilization data
router.get('/getUtilizationData', utilizationService.getUtilizationApi);
router.post('/saveUtilizationData', utilizationService.saveUtilizationDataToCSV);

module.exports = router;
