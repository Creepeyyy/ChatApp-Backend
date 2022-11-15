const chai = require('chai');
const assert = chai.assert;
const server = require('../../httpServer').server;
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

var token, usertoken;
describe("Authentication Tests", function () {
    it("Einloggen als Standardadmin", function (done) {
        chai.request(server)
            .get("/authenticate")
            .set("Authorization", "Basic " + Buffer.from("admin:123").toString("base64"))
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isOk(res.header.authorization);
                token = res.header.authorization;
                done();
            });
    });

    it("Einloggen als Standardadmin mit falschem Passwort", function (done) {
        chai.request(server)
            .get("/authenticate")
            .set("Authorization", "Basic " + Buffer.from("admin:1234").toString("base64"))
            .end(function (err, res) {
                assert.equal(res.status, 401);
                assert.isNotOk(res.header.authorization);
                done();
            });
    });

    it("Einloggen als User", function (done) {
        chai.request(server)
            .get("/authenticate")
            .set("Authorization", "Basic " + Buffer.from("Günther:1234", "utf-8").toString("base64"))
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isOk(res.header.authorization);
                usertoken = res.header.authorization;
                done();
            });
    });
});

describe("Ausgaben Tests", function () {
    it("Versuchen User zu bekommen ohne Token", function (done) {
        chai.request(server)
            .get("/users")
            .end(function (err, res) {
                assert.equal(res.status, 401);
                done();
            });
    });

    it("Versuchen User zu bekommen mit Token", function (done) {
        chai.request(server)
            .get("/users")
            .set("Authorization", token)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isAtLeast(res.body.length, 1);
                done();
            });
    });

    it("Prüfen, ob man persönliche Daten sehen kann", function (done) {
        chai.request(server)
            .get("/users")
            .set("Authorization", token)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.doesNotHaveAnyKeys(res.body[0], ["password", "_id", "updatedAt", "createdAt", "__v"]);
                done();
            });
    });
});

describe("Berechtigungstests", function () {
    const user = {
        "userID": "manfred",
        "userName": "Manfred Mustermann",
        "password": "asdf"
    }
    describe("Mit Admintoken", function () {
        it("User bekommen", function (done) {
            chai.request(server)
                .get("/users")
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isAtLeast(res.body.length, 1);
                    done();
                });
        });

        it("User anlegen", function (done) {
            chai.request(server)
                .post("/users")
                .set("Authorization", token, "content-type", "application/json")
                .send(user)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    assert.equal(res.body.userID, user.userID);
                    assert.equal(res.body.userName, user.userName);
                    done();
                });
        });

        it("User bearbeiten", function (done) {
            const newData = {
                "userID": "manfred",
                "userName": "Manfred Müller",
                "password": "heiko"
            }
            chai.request(server)
                .put("/users/" + newData.userID)
                .set("Authorization", token, "content-type", "application/json")
                .send(newData)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });

        it("User nach ID suchen", function (done) {
            chai.request(server)
                .get("/users/" + user.userID)
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.userID, user.userID);
                    done();
                });
        });

        it("User löschen", function (done) {
            chai.request(server)
                .delete("/users/" + user.userID)
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });

    describe("Mit Usertoken", function () {
        it("User bekommen", function (done) {
            chai.request(server)
                .get("/users")
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 403);
                    done();
                });
        });

        it("User anlegen", function (done) {
            chai.request(server)
                .post("/users")
                .set("Authorization", usertoken, "content-type", "application/json")
                .send(user)
                .end(function (err, res) {
                    assert.equal(res.status, 403);
                    done();
                });
        });

        it("User bearbeiten", function (done) {
            const newData = {
                "userID": "manfred",
                "userName": "Manfred Müller",
                "password": "heiko"
            }
            chai.request(server)
                .put("/users/" + newData.userID)
                .set("Authorization", usertoken, "content-type", "application/json")
                .send(newData)
                .end(function (err, res) {
                    assert.equal(res.status, 403);
                    done();
                });
        });

        it("User nach ID suchen", function (done) {
            chai.request(server)
                .get("/users/" + "admin")
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 403);
                    done();
                });
        });

        it("Sich selbst nach ID suchen", function (done) {
            chai.request(server)
                .get("/users/" + "Günther")
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });

        it("User löschen", function (done) {
            chai.request(server)
                .delete("/users/" + user.userID)
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 403);
                    done();
                });
        });
    });

    describe("Ohne Token", function () {
        it("User anlegen", function (done) {
            chai.request(server)
                .post("/users")
                .set("content-type", "application/json")
                .send(user)
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });
    });
});