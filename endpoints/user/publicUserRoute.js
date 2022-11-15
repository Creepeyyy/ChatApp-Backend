const express = require('express');
const router = express.Router();
const userMethods = require('./userMethods');

router.get('/', userMethods.getUsers);

router.post('/', userMethods.createUser);

router.delete('/:userID', userMethods.deleteUser);

router.get('/:userID', userMethods.searchUserById);

router.put('/:userID', userMethods.updateUser);

module.exports = router;