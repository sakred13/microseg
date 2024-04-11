// utilizationRoutes.js

const express = require('express');
const router = express.Router();
const utilizationService = require('../services/utilizationService');

// Define the route for getting utilization data
router.get('/api/getUtilizationData', utilizationService.getUtilizationApi);
router.post('/api/saveUtilizationData', utilizationService.saveUtilizationDataToCSV);

module.exports = router;
