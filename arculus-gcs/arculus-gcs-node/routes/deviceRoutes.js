const express = require('express');
const deviceService = require('../services/deviceService');
const router = express.Router();
const cors = require('cors');

router.get('/api/getTrustedDevices', deviceService.getTrustedDevices);
router.get('/api/getMoreNodes', deviceService.getMoreNodes);
router.post('/api/addTrustedDevice', deviceService.addTrustedDevice);
router.put('/api/updateTrustedDevice', deviceService.updateTrustedDevice);
router.delete('/api/removeTrustedDevice', deviceService.removeTrustedDevice);
router.post('/api/clusterJoinRequest', cors({
    origin: deviceService.subnetIps,
    methods: 'POST',
    credentials: true,
}),
    deviceService.clusterJoinRequest);
router.get('/api/getToken', cors({
    origin: deviceService.subnetIps,
    methods: 'GET',
    credentials: true,
}),
    deviceService.getToken);
router.post('/addToCluster', deviceService.addToCluster);

module.exports = router;