const appData = require('../../httpServer');
const { app, server } = appData;
var logger = require('../../config/logger');
const database = require('../../database/db');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

before((done) => {
    app.on("started", () => done());
});

describe('/publicUser tests', function (done) {
    logger.info("/publicUser tests");
    require('./publicUserTests');
});

describe('/authentication and /user tests', function () {
    logger.info("/authentication and /user tests");
    require('./userTests');
});

describe('/forum and /forumMessage tests', function () {
    logger.info("/forum and /forumMessage tests");
    require('./forumTests');
});

describe('/register and /verification tests', function () {
    logger.info("/register and /verification tests");
    require('./registerTests');
});

describe('/newsletter', function () {
    logger.info("/newsletter");
    require('./newsletterTests');
});

describe('/chat and /chat/:id', function () {
    logger.info("/chat and /chat/:id");
    require('./chatTests');
});

after(done => {
    database.clearDb()
        .then(() => {
            server.close();
            database.closeDb().then(done());
        });
});

