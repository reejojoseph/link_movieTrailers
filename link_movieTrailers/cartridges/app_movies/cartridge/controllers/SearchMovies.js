'use strict';

var server = require('server');

var URLUtils = require('dw/web/URLUtils');

var searchMoviesHelpers = require('*/cartridge/scripts/helpers/searchMoviesHelpers');
/**
  * SearchMovies-Show : This endpoint is to show a page for searching for movies
  * @name SearchMovies-Show
  * @function
  * @memberof SearchMovies
  * @param {middleware} - cache.applyPromotionSensitiveCache
  * @param {serverfunction} - get
  */
server.get('Show', server.middleware.https, function (req, res, next) {
    var searchPageData = searchMoviesHelpers.getSearchPageData();
    searchPageData.actionUrl = URLUtils.url('SearchMovies-Search').toString();
    searchPageData.fetchVideoUrl = URLUtils.url('SearchMovies-GetVideo').toString();
    searchPageData.movieRequestFormUrl = URLUtils.url('SearchMovies-PutRequest').toString();
    res.render('movie/searchmovie', searchPageData);
    next();
});

/**
  * SearchMovies-Search : This endpoint is to get movie search results and show on UI
  * @name SearchMovies-Search
  * @function
  * @memberof SearchMovies
  * @param {httpparameter} - keyword - product ID
  * @param {httpparameter} - genres - quantity of product
  * @param {httpparameter} - language - list of product options
  * @param {httpparameter} - releaseYear - list of product options
  * @param {serverfunction} - post
  */
server.post('Search', server.middleware.https, function (req, res, next) {
    var form = req.form;
    var searchResults = searchMoviesHelpers.getSearchResults(form);
    res.render('movie/searchResults', { searchResults: searchResults });
    next();
});

/**
  * SearchMovies-GetVideo : This endpoint is to get movie video embedHTML
  * @name SearchMovies-GetVideo
  * @function
  * @memberof SearchMovies
  * @param {middleware} - cache.applyPromotionSensitiveCache
  * @param {serverfunction} - get
  */
server.get('GetVideo', server.middleware.https, function (req, res, next) {
    var imdbId = req.querystring.imdbId;
    var width = req.querystring.width;
    var videoDetails = searchMoviesHelpers.getVideo(imdbId, width);
    res.json({ videoDetails: videoDetails });
    next();
});

/**
  * SearchMovies-Search : This endpoint is to get movie search results and show on UI
  * @name SearchMovies-Search
  * @function
  * @memberof SearchMovies
  * @param {httpparameter} - keyword - product ID
  * @param {httpparameter} - genres - quantity of product
  * @param {httpparameter} - language - list of product options
  * @param {httpparameter} - releaseYear - list of product options
  * @param {serverfunction} - post
  */
server.post('PutRequest', server.middleware.https, function (req, res, next) {
    var form = req.form;
    var resp = searchMoviesHelpers.updateRequest(form);
    res.json({ resp: resp });
    next();
});

module.exports = server.exports();
