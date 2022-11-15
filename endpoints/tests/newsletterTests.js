const chai = require('chai');
const assert = chai.assert;
const server = require('../../httpServer').server;
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

let token;
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
});

describe("Newsletter Tests", function () {
    it("Newsletter versenden", function (done) {
        chai.request(server)
            .post("/newsletter")
            .set("Authorization", token, "content-type", "application/json")
            .send({ subject: "Bitte verifizieren Sie sich.", text: "Wir erwarten von allen Usern, dass sie sich verifizieren." })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                done();
            });
    });
});