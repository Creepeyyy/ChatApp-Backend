const chai = require('chai');
const assert = chai.assert;
const server = require('../../httpServer').server;
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

let token, usertoken;
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
let register = (userData) => {
    it("User registrieren", function (done) {
        chai.request(server)
            .post("/register")
            .set("content-type", "application/json")
            .send(userData)
            .end(function (err, res) {
                assert.equal(res.status, 201);
                done();
            });
    });
}
describe("Register Tests", function () {
    const user = {
        "userID": "Heiko",
        "userName": "Heiko Mustermann",
        "password": "asdf",
        "email": "heiko.heikohausen@gmail.com"
    }
    const user2 = {
        "userID": "Max",
        "userName": "Max Mustermann",
        "password": "asdf"
    }
    register(user);

    it("User registrieren ohne Mail", function (done) {
        chai.request(server)
            .post("/register")
            .set("content-type", "application/json")
            .send(user2)
            .end(function (err, res) {
                assert.equal(res.status, 201);
                done();
            });
    });

    const testMail = "test.test@mail.com";
    it("User, der noch keine Mail hat Mail senden", function (done) {
        chai.request(server)
            .post("/register/verification")
            .set("Authorization", usertoken, "content-type", "application/json")
            .send({ "email": testMail })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                done();
            });
    });

    it("Prüfen, ob user jetzt mail hat", function (done) {
        chai.request(server)
            .get("/publicUsers/Günther")
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.email, testMail);
                done();
            });
    });
});

describe("Register Bullettests", function () {
    const user = {
        "userID": "Hackerman",
        "userName": "Hacker",
        "password": "hackme",
        "email": "heiko.heikohausen@gmail.com",
        "isAdministrator": true
    }

    register(user);

    it("Prüfen, ob user jetzt admin ist", function (done) {
        chai.request(server)
            .get("/publicUsers/" + user.userID)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isNotTrue(res.body.isAdministrator);
                done();
            });
    });

    it("Ungültige Verificationadresse testen", function (done) {
        chai.request(server)
            .get("/register/verification/sda3sdf333")
            .end(function (err, res) {
                assert.equal(res.status, 401);
                done();
            });
    });
});