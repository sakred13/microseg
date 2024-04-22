const express = require('express');
const userService = require('../services/userService');
const router = express.Router();

router.post('/updateUser', userService.updateUser);
router.delete('/deleteUser', userService.deleteUser);
router.get('/getUsers', userService.getUsers);
router.get('/getCurrentUser', userService.getCurrentUser);

module.exports = router;