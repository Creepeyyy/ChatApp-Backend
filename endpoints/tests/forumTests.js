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

let forumThreadID;
describe("Forum Crud Tests", function () {
    describe("Mit Admintoken", function () {
        let updatedForum1 = {
            "_id": undefined,
            "description": "Dies ist ein Test"
        };;
        const forum1 = {
            "name": "Mein erstes Forum",
            "description": "Das ist ein erstes Forum, das ich im Rahmen der Tests angelegt habe"
        };
        let forum2ID;
        const forum2 = {
            "name": "Mein zweites Forum",
            "description": "Das ist ein zweites Forum, das ich im Rahmen der Tests angelegt habe",
        };

        it("Foren ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads")
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.length, 0);
                    done();
                });
        });

        it("Forum erstellen", function (done) {
            chai.request(server)
                .post("/forumThreads")
                .set("Authorization", token, "content-type", "application/json")
                .send(forum1)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    assert.equal(res.body.ownerID, "admin");
                    forumThreadID = res.body._id;
                    updatedForum1._id = res.body._id;
                    done();
                });
        });

        it("Eigene Foren ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads/myForumThreads")
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.equal(res.body[0].name, forum1.name);
                    assert.equal(res.body[0].ownerID, "admin");
                    done();
                });
        });

        it("Forum updaten", function (done) {
            chai.request(server)
                .put("/forumThreads/" + updatedForum1._id)
                .set("Authorization", token, "content-type", "application/json")
                .send(updatedForum1)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    done();
                });
        });

        it("Forum nach OwnerID ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads/?ownerID=admin")
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isAtLeast(res.body.length, 1);
                    assert.equal(res.body[0].name, forum1.name);
                    assert.equal(res.body[0].description, updatedForum1.description);
                    assert.equal(res.body[0].ownerID, "admin");
                    done();
                });
        });

        it("Forum nach ID ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads/" + updatedForum1._id)
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.description, updatedForum1.description);
                    assert.equal(res.body.ownerID, "admin");
                    assert.equal(res.body.name, forum1.name);
                    done();
                });
        });

        it("Zweites Forum erstellen", function (done) {
            chai.request(server)
                .post("/forumThreads")
                .set("Authorization", token, "content-type", "application/json")
                .send(forum2)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    assert.equal(res.body.ownerID, "admin");
                    forum2ID = res.body._id;
                    done();
                });
        });

        it("Forum löschen", function (done) {
            chai.request(server)
                .delete("/forumThreads/" + forum2ID)
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });

    describe("Mit Usertoken", function () {
        let updatedForum1 = {
            "_id": undefined,
            "description": "Dies ist ein Test"
        };;
        const forum1 = {
            "name": "Mein erstes UserForum",
            "description": "Das ist ein erstes Forum, das ich im Rahmen der Tests angelegt habe"
        };
        let forum2ID;
        const forum2 = {
            "name": "Mein zweites UserForum",
            "description": "Das ist ein zweites Forum, das ich im Rahmen der Tests angelegt habe",
        };
        it("Foren ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads")
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.length, 1);
                    done();
                });
        });

        it("Forum erstellen", function (done) {
            chai.request(server)
                .post("/forumThreads")
                .set("Authorization", usertoken, "content-type", "application/json")
                .send(forum1)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    assert.equal(res.body.ownerID, "Günther");
                    updatedForum1._id = res.body._id;
                    done();
                });
        });

        it("Eigene Foren ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads/myForumThreads")
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.equal(res.body[0].name, forum1.name);
                    assert.equal(res.body[0].ownerID, "Günther");
                    done();
                });
        });

        it("Forum updaten", function (done) {
            chai.request(server)
                .put("/forumThreads/" + updatedForum1._id)
                .set("Authorization", usertoken, "content-type", "application/json")
                .send(updatedForum1)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    done();
                });
        });

        it("Forum nach OwnerID ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads?ownerID=Günther")
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });

        it("Forum nach ID ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads/" + updatedForum1._id)
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.name, forum1.name);
                    assert.equal(res.body.description, updatedForum1.description);
                    assert.equal(res.body.ownerID, "Günther");
                    done();
                });
        });

        it("Zweites Forum erstellen", function (done) {
            chai.request(server)
                .post("/forumThreads")
                .set("Authorization", usertoken, "content-type", "application/json")
                .send(forum2)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    assert.equal(res.body.ownerID, "Günther");
                    forum2ID = res.body._id;
                    done();
                });
        });

        it("Forum löschen", function (done) {
            chai.request(server)
                .delete("/forumThreads/" + forum2ID)
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });

    describe("Ohne Token", function () {
        let updatedForum1 = {
            "description": "Test"
        };;
        const forum1 = {
            "name": "Test",
            "description": "Test"
        };
        let forum2ID;
        const forum2 = {
            "name": "Test",
            "description": "Test",
        };
        it("Foren ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads")
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isAtLeast(res.body.length, 2);
                    done();
                });
        });

        it("Forum erstellen", function (done) {
            chai.request(server)
                .post("/forumThreads")
                .set("content-type", "application/json")
                .send(forum1)
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });

        it("Eigene Foren ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads/myForumThreads")
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });

        it("Forum updaten", function (done) {
            chai.request(server)
                .put("/forumThreads/" + updatedForum1._id)
                .set("content-type", "application/json")
                .send(updatedForum1)
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });

        it("Forum nach OwnerID ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads?ownerID=Günther")
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });

        it("Forum nach ID ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumThreads/" + forumThreadID)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });

        it("Zweites Forum erstellen", function (done) {
            chai.request(server)
                .post("/forumThreads")
                .set("content-type", "application/json")
                .send(forum2)
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });

        it("Forum löschen", function (done) {
            chai.request(server)
                .delete("/forumThreads/" + forum2._id)
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });
    });
});

describe("Forum Bullettesting", function () {
    let updatedForum1 = {
        "_id": undefined,
        "description": "Dies ist ein Test"
    };;
    let id;
    const forum1 = {
        "name": "Mein erstes Forum",
        "description": "Das ist ein erstes Forum, das ich im Rahmen der Tests angelegt habe",
        "ownerID": "Günther"
    };

    it("Forum erstellen", function (done) {
        chai.request(server)
            .post("/forumThreads")
            .set("Authorization", token, "content-type", "application/json")
            .send(forum1)
            .end(function (err, res) {
                assert.equal(res.status, 201);
                assert.equal(res.body.ownerID, "admin");
                id = res.body._id;
                updatedForum1._id = res.body._id;
                done();
            });
    });

    it("Forum updaten", function (done) {
        chai.request(server)
            .put("/forumThreads/" + updatedForum1._id)
            .set("Authorization", usertoken, "content-type", "application/json")
            .send(updatedForum1)
            .end(function (err, res) {
                assert.equal(res.status, 403);
                done();
            });
    });

    it("Forum löschen", function (done) {
        chai.request(server)
            .delete("/forumThreads/" + id)
            .set("Authorization", usertoken, "content-type", "application/json")
            .end(function (err, res) {
                assert.equal(res.status, 403);
                done();
            });
    });
});

describe("ForumMessage Crud Tests", function () {
    describe("Mit Admintoken", function () {
        let updatedMessage1 = {
            "_id": undefined,
            "text": "Dies ist der neue Text."
        };;
        let message1 = {
            "forumThreadID": undefined,
            "title": "Hallo, dies ist meine erste Nachricht.",
            "text": "Hallo, in dieser Nachricht soll es um das Forum gehen."
        };
        let message2ID;
        let message2 = {
            "forumThreadID": undefined,
            "title": "Hallo, dies ist meine zweite Nachricht.",
            "text": "Hallo, in dieser Nachricht soll es auch um das Forum gehen."
        };

        it("Messages ausgeben lassen", function (done) {
            message1.forumThreadID = forumThreadID;
            message2.forumThreadID = forumThreadID;
            chai.request(server)
                .get("/forumMessages")
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.length, 0);
                    done();
                });
        });

        it("Message erstellen", function (done) {
            chai.request(server)
                .post("/forumMessages")
                .set("Authorization", token, "content-type", "application/json")
                .send(message1)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    assert.equal(res.body.authorID, "admin");
                    updatedMessage1._id = res.body._id;
                    done();
                });
        });

        it("Eigene Message ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumMessages/myForumMessages")
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    console.log(res.body);
                    assert.isArray(res.body);
                    assert.equal(res.body[0].forumThreadID, message1.forumThreadID);
                    assert.equal(res.body[0].title, message1.title);
                    assert.equal(res.body[0].text, message1.text);
                    assert.equal(res.body[0].authorID, "admin");
                    done();
                });
        });

        it("Message updaten", function (done) {
            chai.request(server)
                .put("/forumMessages/" + updatedMessage1._id)
                .set("Authorization", token, "content-type", "application/json")
                .send(updatedMessage1)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    done();
                });
        });

        it("Message nach AuthorID ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumMessages/getByAuthorID/admin")
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isAtLeast(res.body.length, 1);
                    assert.equal(res.body[0].forumThreadID, message1.forumThreadID);
                    assert.equal(res.body[0].title, message1.title);
                    assert.equal(res.body[0].text, updatedMessage1.text);
                    assert.equal(res.body[0].authorID, "admin");
                    done();
                });
        });

        it("Message nach ID ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumMessages?forumThreadID=" + forumThreadID)
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body[0].forumThreadID, message1.forumThreadID);
                    assert.equal(res.body[0].title, message1.title);
                    assert.equal(res.body[0].text, updatedMessage1.text);
                    assert.equal(res.body[0].authorID, "admin");
                    done();
                });
        });

        it("Zweite Message erstellen", function (done) {
            chai.request(server)
                .post("/forumMessages")
                .set("Authorization", token, "content-type", "application/json")
                .send(message2)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    assert.equal(res.body.authorID, "admin");
                    message2ID = res.body._id;
                    done();
                });
        });

        it("Message löschen", function (done) {
            chai.request(server)
                .delete("/forumMessages/" + message2ID)
                .set("Authorization", token)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });

    describe("Mit Usertoken", function () {
        let updatedMessage1 = {
            "_id": undefined,
            "text": "Lorem Ipsus."
        };;
        const message1 = {
            "forumThreadID": undefined,
            "title": "Hallo, dies ist meine erste Nachricht.",
            "text": "Hallo, ich wollte nur mal hallo schreiben."
        };
        let message2ID;
        const message2 = {
            "forumThreadID": undefined,
            "title": "Hallo, dies ist meine zweite Nachricht.",
            "text": "Hallo, wie geht es euch?"
        };

        it("Messages ausgeben lassen", function (done) {
            message1.forumThreadID = forumThreadID;
            message2.forumThreadID = forumThreadID;
            chai.request(server)
                .get("/forumMessages")
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.length, 1);
                    done();
                });
        });

        it("Message erstellen", function (done) {
            chai.request(server)
                .post("/forumMessages")
                .set("Authorization", usertoken, "content-type", "application/json")
                .send(message1)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    assert.equal(res.body.authorID, "Günther");
                    updatedMessage1._id = res.body._id;
                    done();
                });
        });

        it("Eigene Message ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumMessages/myForumMessages")
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.equal(res.body[0].forumThreadID, message1.forumThreadID);
                    assert.equal(res.body[0].title, message1.title);
                    assert.equal(res.body[0].text, message1.text);
                    assert.equal(res.body[0].authorID, "Günther");
                    done();
                });
        });

        it("Message updaten", function (done) {
            chai.request(server)
                .put("/forumMessages/" + updatedMessage1._id)
                .set("Authorization", usertoken, "content-type", "application/json")
                .send(updatedMessage1)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    done();
                });
        });

        it("Message nach AuthorID ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumMessages/getByAuthorID/Günther")
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 403);
                    done();
                });
        });

        it("Message nach ID ausgeben lassen", function (done) {
            chai.request(server)
                .get(`/forumThreads/${forumThreadID}/forumMessages`)
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body[0].forumThreadID, message1.forumThreadID);
                    assert.equal(res.body[0].title, "Hallo, dies ist meine erste Nachricht.");
                    assert.equal(res.body[0].text, "Dies ist der neue Text.");
                    assert.equal(res.body[0].authorID, "admin");
                    done();
                });
        });

        it("Zweite Message erstellen", function (done) {
            chai.request(server)
                .post("/forumMessages")
                .set("Authorization", usertoken, "content-type", "application/json")
                .send(message2)
                .end(function (err, res) {
                    assert.equal(res.status, 201);
                    assert.equal(res.body.authorID, "Günther");
                    message2ID = res.body._id;
                    done();
                });
        });

        it("Message löschen", function (done) {
            chai.request(server)
                .delete(`/forumMessages/${message2ID}`)
                .set("Authorization", usertoken)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });

    describe("Ohne Token", function () {
        let updatedMessage1 = {
            "_id": undefined,
            "text": "Dies ist der neue Text."
        };;
        const message1 = {
            "forumThreadID": forumThreadID,
            "title": "Hallo, dies ist meine erste Nachricht.",
            "text": "Hallo, in dieser Nachricht soll es um das Forum gehen."
        };
        let message2ID;
        const message2 = {
            "forumThreadID": forumThreadID,
            "title": "Hallo, dies ist meine zweite Nachricht.",
            "text": "Hallo, in dieser Nachricht soll es auch um das Forum gehen."
        };

        it("Messages ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumMessages")
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.length, 2);
                    done();
                });
        });

        it("Message erstellen", function (done) {
            chai.request(server)
                .post("/forumMessages")
                .set("content-type", "application/json")
                .send(message1)
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });

        it("Messages aus Forum ausgeben lassen", function (done) {
            chai.request(server)
                .get(`/forumMessages/myForumMessages`)
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });

        it("Message updaten", function (done) {
            chai.request(server)
                .put("/forumMessages/" + updatedMessage1._id)
                .set("content-type", "application/json")
                .send(updatedMessage1)
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });

        it("Message nach AuthorID ausgeben lassen", function (done) {
            chai.request(server)
                .get("/forumMessages/getByAuthorID/admin")
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });

        it("Message nach ID ausgeben lassen", function (done) {
            chai.request(server)
                .get(`/forumMessages/?forumThreadID=${forumThreadID}`)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    done();
                });
        });

        it("Zweite Message erstellen", function (done) {
            chai.request(server)
                .post("/forumMessages")
                .set("content-type", "application/json")
                .send(message2)
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });

        it("Message löschen", function (done) {
            chai.request(server)
                .delete("/forumMessages/" + message2ID)
                .end(function (err, res) {
                    assert.equal(res.status, 401);
                    done();
                });
        });
    });
});

describe("Message Bullettesting", function () {
    let updatedMessage1 = {
        "_id": undefined,
        "description": "Dies ist ein Test"
    };;
    let id;
    let message1 = {
        "forumThreadID": undefined,
        "title": "Hallo, dies ist meine erste Nachricht.",
        "text": "Hallo, in dieser Nachricht soll es um das Forum gehen."
    };

    it("Message erstellen", function (done) {
        message1.forumThreadID = forumThreadID;
        chai.request(server)
            .post("/forumMessages")
            .set("Authorization", token, "content-type", "application/json")
            .send(message1)
            .end(function (err, res) {
                assert.equal(res.status, 201);
                assert.equal(res.body.authorID, "admin");
                id = res.body._id;
                updatedMessage1._id = res.body._id;
                done();
            });
    });

    it("Forum updaten", function (done) {
        chai.request(server)
            .put("/forumMessages/" + updatedMessage1._id)
            .set("Authorization", usertoken, "content-type", "application/json")
            .send(updatedMessage1)
            .end(function (err, res) {
                assert.equal(res.status, 403);
                done();
            });
    });

    it("Forum löschen", function (done) {
        chai.request(server)
            .delete("/forumMessages/" + id)
            .set("Authorization", usertoken)
            .end(function (err, res) {
                assert.equal(res.status, 403);
                done();
            });
    });
});

describe("Ausgaben Tests", function () {
    it("Prüfen, ob man persönliche Daten sehen kann", function (done) {
        chai.request(server)
            .get("/forumThreads")
            .set("Authorization", token)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.doesNotHaveAnyKeys(res.body[0], ["updatedAt", "createdAt", "__v"]);
                done();
            });
    });
    it("Prüfen, ob man persönliche Daten sehen kann", function (done) {
        chai.request(server)
            .get("/forumMessages")
            .set("Authorization", token)
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.doesNotHaveAnyKeys(res.body[0], ["updatedAt", "createdAt", "__v"]);
                done();
            });
    });
});