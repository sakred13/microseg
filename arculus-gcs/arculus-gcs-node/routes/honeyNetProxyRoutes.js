const express = require('express');
const honeyNetProxyService = require('../services/honeyNetProxyService');
const router = express.Router();


// Proxy route for honeypot API
router.all('/*', honeyNetProxyService.honeyPotApi);

module.exports = router;