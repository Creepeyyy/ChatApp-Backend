const chai = require('chai');
const assert = chai.assert;
const server = require('../../httpServer').server;
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

let hashedPw;
describe("Wird Standardadmin angelegt?", function () {
    it("Prüfen, ob ein Admin zurückgegeben wird", function (done) {
        chai.request(server)
            .get("/publicUsers")
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.isAtLeast(res.body.length, 1);
                assert.equal(res.body[0].userID, "admin");
                assert.isTrue(res.body[0].isAdministrator);
                hashedPw = res.body[0].password;
                done();
            });
    });
});

describe("Passworttest", function () {
    it("Prüfen, ob Passwort korrekt zurückgegeben wird", function (done) {
        chai.request(server)
            .get("/publicUsers")
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body[0].password, hashedPw);
                done();
            });
    });
});

const user = {
    "userID": "manfred",
    "userName": "Manfred Mustermann",
    "password": "asdf"
}
describe("User anlegen", function () {
    it("User erstes Mal anlegen", function (done) {
        chai.request(server)
            .post("/publicUsers")
            .set("content-type", "application/json")
            .send(user)
            .end(function (err, res) {
                assert.equal(res.status, 201);
                assert.equal(res.body.userID, user.userID);
                assert.equal(res.body.userName, user.userName);
                done();
            });
    });
    it("User zweites Mal anlegen", function (done) {
        chai.request(server)
            .post("/publicUsers")
            .set("content-type", "application/json")
            .send(user)
            .end(function (err, res) {
                assert.equal(res.status, 400);
                done();
            });
    });
    it("Nicht admin User anlegen", function (done) {
        const user2 = {
            "userID": "Günther",
            "userName": "Heiko",
            "password": "1234"
        }
        chai.request(server)
            .post("/publicUsers")
            .set("content-type", "application/json")
            .send(user2)
            .end(function (err, res) {
                assert.equal(res.status, 201);
                assert.equal(res.body.userID, user2.userID);
                assert.equal(res.body.userName, user2.userName);
                done();
            });
    });
});

describe("User per ID finden", function () {
    it("User der existiert suchen", function (done) {
        chai.request(server)
            .get("/publicUsers/" + user.userID)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.userID, user.userID);
                done();
            });
    });
    it("User der nicht existiert suchen", function (done) {
        chai.request(server)
            .post("/publicUsers/günther")
            .end(function (err, res) {
                assert.equal(res.status, 404);
                done();
            });
    });
});

describe("User bearbeiten ohne Passwort", function () {
    let updatedUser;
    const newData = {
        "userID": user.userID,
        "userName": "Manfred Müller"
    }
    it("Userdaten bekommen", function (done) {
        chai.request(server)
            .get("/publicUsers/" + newData.userID)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                updatedUser = res.body;
                done();
            });
    });

    it("User bearbeiten", function (done) {
        chai.request(server)
            .put("/publicUsers/" + newData.userID)
            .set("content-type", "application/json")
            .send(newData)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                done();
            });
    });

    it("Prüfen, ob user geupdatet wurde ohne Passwort", function (done) {
        chai.request(server)
            .get("/publicUsers/" + newData.userID)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.userID, updatedUser.userID);
                assert.equal(res.body.userName, newData.userName);
                assert.equal(res.body.password, updatedUser.password);
                done();
            });
    });
});

describe("User bearbeiten mit Passwort", function () {
    let updatedUser;
    const newData = {
        "userID": "manfred",
        "userName": "Manfred Müller",
        "password": "heiko"
    }
    it("Userdaten bekommen", function (done) {
        chai.request(server)
            .get("/publicUsers/" + newData.userID)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                updatedUser = res.body;
                done();
            });
    });

    it("User bearbeiten", function (done) {
        chai.request(server)
            .put("/publicUsers/" + newData.userID)
            .set("content-type", "application/json")
            .send(newData)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                done();
            });
    });

    it("Prüfen, ob user geupdatet wurde mit Passwort", function (done) {
        chai.request(server)
            .get("/publicUsers/" + newData.userID)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.userID, updatedUser.userID);
                assert.equal(res.body.userName, newData.userName);
                assert.notDeepEqual(res.body.password, updatedUser.password);
                done();
            });
    });
});

describe("User löschen", function () {
    it("Prüfen, ob User, der existiert gelöscht wird", function (done) {
        chai.request(server)
            .delete("/publicUsers/" + user.userID)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                done();
            });
    });
    it("Prüfen, ob User noch existiert", function (done) {
        chai.request(server)
            .get("/publicUsers/" + user.userID)
            .end(function (err, res) {
                assert.equal(res.status, 404);
                done();
            });
    });
    it("Prüfen, ob User, der nicht existiert gelöscht wird", function (done) {
        chai.request(server)
            .delete("/publicUsers/" + user.userID)
            .end(function (err, res) {
                assert.equal(res.status, 404);
                done();
            });
    });
});
