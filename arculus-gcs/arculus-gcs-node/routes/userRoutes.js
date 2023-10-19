const express = require('express');
const userService = require('../services/userService');
const router = express.Router();

router.post('/api/updateUser', userService.updateUser);
router.delete('/api/deleteUser', userService.deleteUser);
router.get('/api/getUsers', userService.getUsers);

module.exports = router;