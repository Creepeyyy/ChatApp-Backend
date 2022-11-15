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

describe("Chat Crud Tests", function () {
    let updatedChat = {
        "_id": undefined,
        "chatName": "Mein chat mit Günni",
        "users": ["Heiko"]
    };;
    const chat = {
        "chatName": "Mein chat mit Günther",
        "chatDescription": "Dies ist ein Chat mit Günni.",
        "users": ["Günther"]
    };

    it("Chats ausgeben lassen für Admin", function (done) {
        chai.request(server)
            .get("/chats")
            .set("Authorization", token)
            .end(function (err, res) {
                assert.equal(res.status, 204);
                done();
            });
    });

    it("Chat erstellen", function (done) {
        chai.request(server)
            .post("/chats")
            .set("Authorization", token, "content-type", "application/json")
            .send(chat)
            .end(function (err, res) {
                assert.equal(res.status, 201);
                assert.equal(res.body.ownerID, "admin");
                updatedChat._id = res.body._id;
                done();
            });
    });

    it("Eigene Chats ausgeben lassen für Admin", function (done) {
        chai.request(server)
            .get("/chats")
            .set("Authorization", token)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].ownerID, "admin");
                done();
            });
    });

    it("Versuchen Chat als nicht owner zu updaten", function (done) {
        chai.request(server)
            .put("/chats")
            .set("Authorization", usertoken, "content-type", "application/json")
            .send(updatedChat)
            .end(function (err, res) {
                assert.equal(res.status, 403);
                done();
            });
    });

    it("Chat updaten als owner", function (done) {
        chai.request(server)
            .put("/chats")
            .set("Authorization", token, "content-type", "application/json")
            .send(updatedChat)
            .end(function (err, res) {
                assert.equal(res.status, 201);
                done();
            });
    });

    it("Prüfen, ob Chat geupdatet wurde", function (done) {
        chai.request(server)
            .get("/chats")
            .set("Authorization", token)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].ownerID, "admin");
                assert.equal(res.body[0].chatName, updatedChat.chatName);
                assert.isTrue(res.body[0].users.includes("Heiko"));
                done();
            });
    });

    it("Versuchen Chat als nicht owner zu löschen", function (done) {
        chai.request(server)
            .delete("/chats")
            .set("Authorization", usertoken, "content-type", "application/json")
            .send({ _id: updatedChat._id })
            .end(function (err, res) {
                assert.equal(res.status, 400);
                done();
            });
    });

    it("Versuchen Chat als owner zu löschen", function (done) {
        chai.request(server)
            .delete("/chats")
            .set("Authorization", token, "content-type", "application/json")
            .send({ _id: updatedChat._id })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                done();
            });
    });
});

describe("ChatMessage Crud Tests", function () {
    let chatID;
    let updatedMessage = {
        "_id": undefined,
        "message": "Dies ist meine bearbeitete Nachricht."
    };;
    const message = {
        "message": "Dies ist eine Nachricht vom Admin."
    };
    const chat = {
        "chatName": "Mein chat mit Günther",
        "chatDescription": "Dies ist ein Chat mit Günni.",
        "users": ["Günther"]
    };

    const messageAusgabe = () => {
        it("Messages ausgeben lassen für Chat mit Günther", function (done) {
            chai.request(server)
                .get(`/chats/${chatID}`)
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 204);
                    done();
                });
        });
    }

    it("Chat erstellen für Messages", function (done) {
        chai.request(server)
            .post("/chats")
            .set("Authorization", token, "content-type", "application/json")
            .send(chat)
            .end(function (err, res) {
                assert.equal(res.status, 201);
                assert.equal(res.body.ownerID, "admin");
                chatID = res.body._id;
                done();
            });
    });

    messageAusgabe();

    it("Message erstellen", function (done) {
        chai.request(server)
            .post(`/chats/${chatID}`)
            .set("Authorization", token, "content-type", "application/json")
            .send(message)
            .end(function (err, res) {
                assert.equal(res.status, 201);
                assert.equal(res.body.authorID, "admin");
                updatedMessage._id = res.body._id;
                done();
            });
    });

    it("Alle Messages ausgeben lassen", function (done) {
        chai.request(server)
            .get(`/chats/${chatID}`)
            .set("Authorization", token)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].authorID, "admin");
                done();
            });
    });

    it("Versuchen Message von Admin zu updaten", function (done) {
        chai.request(server)
            .put(`/chats/${chatID}`)
            .set("Authorization", token, "content-type", "application/json")
            .send(updatedMessage)
            .end(function (err, res) {
                assert.equal(res.status, 201);
                done();
            });
    });

    it("Prüfen, ob Message geupdatet wurde", function (done) {
        chai.request(server)
            .get(`/chats/${chatID}`)
            .set("Authorization", token)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].authorID, "admin");
                assert.equal(res.body[0].message, updatedMessage.message);
                done();
            });
    });

    it("Message löschen", function (done) {
        chai.request(server)
            .delete(`/chats/${chatID}`)
            .set("Authorization", token, "content-type", "application/json")
            .send({ _id: updatedMessage._id })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                done();
            });
    });

    messageAusgabe();
});
