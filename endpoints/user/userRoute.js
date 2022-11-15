const express = require('express');
const router = express.Router();
const userMethods = require('./userMethods');
const verification = require('../utility/verification');

router.get('/', verification.verifyUser, verification.verifyAdmin, userMethods.getUsers);

router.post('/', verification.verifyUser, verification.verifyAdmin, userMethods.createUser);

router.delete('/:userID', verification.verifyUser, verification.verifyAdminOrSelf, userMethods.deleteUser);

router.get('/:userID', verification.verifyUser, verification.verifyAdminOrSelf, userMethods.searchUserById);

router.put('/:userID', verification.verifyUser, verification.verifyAdminOrSelf, userMethods.updateUser);

module.exports = router;


