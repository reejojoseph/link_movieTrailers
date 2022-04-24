window.jQuery = window.$ = require('jquery');
var processInclude = require('base/util');
require('owl.carousel');

$(document).ready(function () {
    processInclude(require('./movieSearch/movieSearch'));
});

require('base/thirdParty/bootstrap');
require('base/components/spinner');
