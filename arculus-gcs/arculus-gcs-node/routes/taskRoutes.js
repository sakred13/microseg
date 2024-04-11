const express = require('express');
const taskService = require('../services/taskService');
const router = express.Router();

router.get('/getTasks', taskService.getTasks);


module.exports = router;