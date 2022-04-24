var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var searchMoviesHelpers;
var form = {
    keyword: 'keyword',
    adSearch: 'true',
    language: 'fr',
    genres: '["crime"]',
    releaseYear: '2016'
};
var imdbId = 'imdbId';
var width = 250;
var videoDetails = {
    success: true,
    embedHTML: 'embedHTML',
    title: 'title description',
    fbShareUrl: 'https://www.facebook.com/sharer.php?u=videoURL',
    tweetUrl: 'https://twitter.com/intent/tweet?url=videoURL'
};
var searchPageData = {
    top25Movies: ['item'],
    recentKeywords: ['keywordsList'],
    supportedLanguages: [{ id: 'lang', 'value': 'language' }],
    genres: 'genres'
};
var reqForm = {
    movieName: 'movieName',
    movieYear: '2016'
};

describe('Search Movie Helpers', function () {
    before(function () {
        searchMoviesHelpers = proxyquire('../../../../../cartridges/app_movies/cartridge/scripts/helpers/searchMoviesHelpers', {
            'dw/system': require('../../../../mocks/dw/system'),
            'dw/system/Transaction': require('../../../../mocks/dw/system/Transaction'),
            'dw/object/CustomObjectMgr': require('../../../../mocks/dw/object/CustomObjectMgr'),
            'dw/web/Resource': require('../../../../mocks/dw/web/Resource'),
            'dw/system/Logger': require('../../../../mocks/dw/system/Logger'),
            '*/cartridge/scripts/services/imdb/helpers/IMDBServiceHelper': require('../../../../mocks/helpers/IMDBServiceHelper'),
            '*/cartridge/scripts/services/youtube/helpers/YoutubeServiceHelpers': require('../../../../mocks/helpers/YoutubeServiceHelpers'),
            '*/cartridge/scripts/helpers/cacheHelpers': require('../../../../mocks/helpers/cacheHelpers'),
            '*/cartridge/scripts/services/imdb/common/IMDBServiceConstants': require('../../../../mocks/helpers/IMDBServiceConstants'),
            '*/cartridge/scripts/services/youtube/common/YoutubeServiceConstants': require('../../../../mocks/helpers/YoutubeServiceConstants')
        });
    });

    it('Validate movie search results from IMDb', function () {
        var details = searchMoviesHelpers.getSearchResults(form);
        assert.deepEqual(['movie'], details);
    });

    it('Validate video details from Youtube', function () {
        var details = searchMoviesHelpers.getVideo(imdbId, width);
        assert.deepEqual(videoDetails, details);
    });

    it('Validate Search home page data', function () {
        var details = searchMoviesHelpers.getSearchPageData();
        assert.deepEqual(searchPageData, details);
    });

    it('Validate Trailer video request', function () {
        var details = searchMoviesHelpers.updateRequest(reqForm);
        assert.deepEqual('label.submit.request.success', details);
    });
});
