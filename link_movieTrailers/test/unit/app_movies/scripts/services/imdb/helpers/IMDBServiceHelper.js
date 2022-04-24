var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var IMDBServiceHelper;

var searchMoviesReqObj = {
    movieName: 'keyword',
    serviceConstant: 'MOVIE_DETAILS'
};

var advSearchMoviesReqObj = {
    params: 'params',
    serviceConstant: 'ADVANCED_SEARCH'
};

var getVideoDetailsReqObj = {
    imdbId: 'imdbId',
    serviceConstant: 'VIDEO_DETAILS'
};

var getTop250MoviesReqObj = {
    serviceConstant: 'TOP_250'
};

describe('IMDb Service Helpers', function () {
    before(function () {
        IMDBServiceHelper = proxyquire('../../../../../../../cartridges/app_movies/cartridge/scripts/services/imdb/helpers/IMDBServiceHelper', {
            'dw/svc/LocalServiceRegistry': require('../../../../../../mocks/dw/svc/LocalServiceRegistry'),
            'dw/system': require('../../../../../../mocks/dw/system'),
            'dw/system/Logger': require('../../../../../../mocks/dw/system/Logger'),
            '*/cartridge/scripts/services/imdb/common/IMDBServiceConstants': require('../../../../../../mocks/helpers/IMDBServiceConstants')
        });
    });

    it('Validate API: imdb.rest.searchmovies', function () {
        var details = IMDBServiceHelper.makeCall(searchMoviesReqObj);
        assert.deepEqual('MOVIE_DETAILS', details);
    });

    it('Validate API: imdb.rest.advancedsearch', function () {
        var details = IMDBServiceHelper.makeCall(advSearchMoviesReqObj);
        assert.deepEqual('ADVANCED_SEARCH', details);
    });

    it('Validate API: imdb.rest.getvideodetails', function () {
        var details = IMDBServiceHelper.makeCall(getVideoDetailsReqObj);
        assert.deepEqual('VIDEO_DETAILS', details);
    });

    it('Validate API: imdb.rest.gettop50', function () {
        var details = IMDBServiceHelper.makeCall(getTop250MoviesReqObj);
        assert.deepEqual('TOP_250', details);
    });
});
