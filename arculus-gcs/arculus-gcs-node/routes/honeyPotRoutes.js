const express = require('express');
const honeyPotService = require('../services/honeyPotService');
const router = express.Router();


// Proxy route for honeypot API
router.post('/deployHoneyPot', honeyPotService.createHoneyPot);

router.get('/getDeployedHoneypots', honeyPotService.getDeployedHoneypots);

module.exports = router;