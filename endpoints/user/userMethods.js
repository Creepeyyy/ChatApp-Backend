const userService = require('./userService');

async function getUsers(req, res) {
    try {
        const users = await userService.getUsers(req.safe);
        res.status(200).json(Object.values(users));
    } catch (e) {
        res.status(400);
    }
}

async function createUser(req, res) {
    try {
        const answer = await userService.createUser(req.body, req.safe);
        if (answer != "error") {
            res.status(201).json(answer);
        } else {
            res.status(400).json({ "Error": "Couldn't create user." });
        }
    } catch (e) {
        res.status(400).send({ "Error": "Something went wrong." });
    }
}

async function deleteUser(req, res) {
    try {
        let answer = await userService.deleteUser(req.params.userID, req.safe);
        if (!answer) {
            res.status(200).json({"Success": "Deleted user."});
        } else if (answer == "not found") {
            res.status(404).json({ "Error": "User not found." });
        } else {
            res.status(400).json({ "Error": "Couldn't delete user." });
        }
    } catch (e) {
        res.status(400).send({"Error": "Something went wrong."});
    }
}

async function searchUserById(req, res) {
    try {
        let answer = await userService.searchUserById(req.params.userID, req.safe);
        if (answer == "error") {
            res.status(400).json(answer);
        } else if (answer == "not found") {
            res.status(404).json({ "Error": "User not found."});
        } else {
            res.status(200).json(answer);
        }
    } catch (e) {
        res.status(400).json({"Error": "Something went wrong"});
    }
}

async function updateUser(req, res) {
    try {
        let newUser = await userService.updateUser(req.params.userID, req.body, req.safe);
        if (newUser == "error") {
            res.status(400).json({"Error": "Something went wrong"});
        } else if (newUser == "not found") {
            res.status(404).json({"Error": "User not found."});
        } else {
            res.status(200).json(newUser);
        }
    } catch (e) {
        res.status(400).json({"Error": "Something went wrong"});
    }
}

module.exports = {
    getUsers,
    deleteUser,
    updateUser,
    searchUserById,
    createUser
}
