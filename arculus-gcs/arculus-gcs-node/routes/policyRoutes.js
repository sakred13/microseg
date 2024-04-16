const express = require('express');
const policyService = require('../services/policyService');
const router = express.Router();


// Proxy route for honeypot API
router.get('/getNetworkPolicies', policyService.getNetworkPolicies);
router.post('/addNetworkPolicy', policyService.addNetworkPolicy);
router.delete('/deleteNetworkPolicy', policyService.deleteNetworkPolicy);


module.exports = router;