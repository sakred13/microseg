const express = require('express');
const deviceService = require('../services/deviceService');
const router = express.Router();
const cors = require('cors');

router.get('/getTrustedDevices', deviceService.getTrustedDevices);
router.get('/getMoreNodes', deviceService.getMoreNodes);
router.post('/addTrustedDevice', deviceService.addTrustedDevice);
router.put('/updateTrustedDevice', deviceService.updateTrustedDevice);
router.delete('/removeTrustedDevice', deviceService.removeTrustedDevice);
router.post('/clusterJoinRequest', cors({
    origin: deviceService.subnetIps,
    methods: 'POST',
    credentials: true,
}),
    deviceService.clusterJoinRequest);
router.get('/getToken', cors({
    origin: deviceService.subnetIps,
    methods: 'GET',
    credentials: true,
}),
    deviceService.getToken);
router.post('/addToCluster', deviceService.addToCluster);
router.delete('/removeFromCluster', deviceService.removeFromCluster);

module.exports = router;