var sinon = require('sinon');

var debug = sinon.stub();
var info = sinon.stub();
var warn = sinon.stub();
var error = sinon.stub();
var getLogger = sinon.stub();

var Logger = {
    debug: debug,
    info: info,
    warn: warn,
    error: error,
    getLogger: getLogger
};

module.exports = Logger;
