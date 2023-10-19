const express = require('express');
const roleService = require('../services/roleService');
const router = express.Router();

router.get('/api/getRoles', roleService.getRoles);

module.exports = router;