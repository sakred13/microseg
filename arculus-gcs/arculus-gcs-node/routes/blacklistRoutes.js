const express = require('express');
const blacklistService = require('../services/blacklistService');
const router = express.Router();


// Proxy route for honeypot API
router.get('/getBlacklist', blacklistService.getBlacklist);

router.delete('/removeFromBlacklist', blacklistService.removeFromBlacklist);

module.exports = router;