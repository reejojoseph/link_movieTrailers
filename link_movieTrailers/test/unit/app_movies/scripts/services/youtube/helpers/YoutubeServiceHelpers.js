var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var YoutubeServiceHelpers;

var playerdetailsReqObj = {
    videoId: 'videoId',
    width: 'width',
    serviceConstant: 'PLAYER_DETAILS'
};

describe('Youtube Service Helpers', function () {
    before(function () {
        YoutubeServiceHelpers = proxyquire('../../../../../../../cartridges/app_movies/cartridge/scripts/services/youtube/helpers/YoutubeServiceHelpers', {
            'dw/svc/LocalServiceRegistry': require('../../../../../../mocks/dw/svc/LocalServiceRegistry'),
            'dw/system': require('../../../../../../mocks/dw/system'),
            'dw/system/Logger': require('../../../../../../mocks/dw/system/Logger'),
            '*/cartridge/scripts/services/youtube/common/YoutubeServiceConstants': require('../../../../../../mocks/helpers/YoutubeServiceConstants')
        });
    });

    it('Validate API: youtube.rest.listvideos', function () {
        var details = YoutubeServiceHelpers.makeCall(playerdetailsReqObj);
        assert.deepEqual('PLAYER_DETAILS', details);
    });
});
