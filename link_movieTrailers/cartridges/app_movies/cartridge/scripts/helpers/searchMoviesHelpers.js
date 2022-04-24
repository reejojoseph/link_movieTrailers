'use strict';

var system = require('dw/system');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');
var Logger = require('dw/system/Logger');

var MOVIES_MAP = 'moviesMap';
var RECENT_KEYWORDS = 'recentKeywords';
var KEYWORD = 'keyword';
var REQUEST_TRAILER_FORM = 'requestTrailerForm';
var FB_SHARE_URL = 'https://www.facebook.com/sharer.php?u=';
var TWEET_URL = 'https://twitter.com/intent/tweet?url=';
var TOP_25_MOVIES = 'top25Movies';


var IMDBServiceHelper = require('*/cartridge/scripts/services/imdb/helpers/IMDBServiceHelper');
var IMDBServiceConstants = require('*/cartridge/scripts/services/imdb/common/IMDBServiceConstants');
var YoutubeServiceHelpers = require('*/cartridge/scripts/services/youtube/helpers/YoutubeServiceHelpers');
var YoutubeServiceConstants = require('*/cartridge/scripts/services/youtube/common/YoutubeServiceConstants');
var cacheHelpers = require('*/cartridge/scripts/helpers/cacheHelpers');


/**
 * Checks whether the movie map already exists
 * @param {Object} movieObj The movie custom object
 * @return {boolean} True if the movie custom object is already present
 */
function isMovieExisting(movieObj) {
    if (movieObj.custom.title) {
        return true;
    }
    return false;
}

/**
 * Checks whether the movie map contains video
 * @param {Object} movieObj The movie custom object
 * @return {boolean} True if the movie custom object contains video
 */
function hasYoutubeVideo(movieObj) {
    if (movieObj.custom.embedHTML) {
        return true;
    }
    return false;
}

/**
 * Retrieves custom object storage
 * If no existing object, an empty one is created
 * @param {string} customObjectName customobject id
 * @param {string} customObjectKey customobject key
 * @returns {dw.object.CustomAttributes} Returns moviesMap custom object
 */
function getObject(customObjectName, customObjectKey) {
    var custObj = CustomObjectMgr.getCustomObject(customObjectName, customObjectKey);
    if (custObj == null) {
        Transaction.begin();
        custObj = CustomObjectMgr.createCustomObject(customObjectName, customObjectKey);
        Transaction.commit();
    }
    return custObj;
}

/**
 * Retrieves custom object storage
 * If no existing temporaryRequestKey object, an empty one is created
 * @param {Object} searchResult - movie details from IMDB
 * @returns {undefined}
 */
function updateCustomObjectWithIMDBValues(searchResult) {
    var maxResults = system.System.getPreferences().custom.maxResults;
    var moviesCounter = 0;
    searchResult.every(function (movie) {
        var id = movie.id ? movie.id : movie.imDbId;
        var custObj = getObject(MOVIES_MAP, id);
        if (!isMovieExisting(custObj) && moviesCounter !== maxResults) {
            Transaction.wrap(function () {
                custObj.custom.title = movie.title;
                custObj.custom.description = movie.description ? movie.description : movie.year;
                custObj.custom.image = movie.image ? movie.image : '';
            });
            moviesCounter++;
        } else if (moviesCounter === maxResults) {
            return false;
        }
        return true;
    });
}

/**
 * Retrieves custom object storage
 * @param {string} customObjectKey - movie custom object key
 * @param {string} videoId - youtube video id
 * @param {Object} embedHtml - youtube player embed html
 * @param {string} videoURL - youtube player video url
 * @returns {undefined}
 */
function updateCustomObjectWithYoutubeValues(customObjectKey, videoId, embedHtml, videoURL) {
    var custObj = getObject(MOVIES_MAP, customObjectKey);

    Transaction.wrap(function () {
        custObj.custom.videoID = videoId;
        custObj.custom.embedHTML = embedHtml;
        custObj.custom.videoURL = videoURL;
    });
}

/**
 * updates custom object storage for recent keywords
 * @param {string} keyword - recent search keyword
 * @returns {undefined}
 */
function updateRecentKeywords(keyword) {
    var keywordsCustObj = getObject(RECENT_KEYWORDS, KEYWORD);
    var keywords = keywordsCustObj.custom.keywordsList;
    var keywordArr;
    if (keywords) {
        keywordArr = JSON.parse(keywords);
        if (keywordArr.indexOf(keyword) === -1) {
            keywordArr.unshift(keyword);
        }
    } else {
        keywordArr = new Array(keyword);
    }

    Transaction.wrap(function () {
        keywordsCustObj.custom.keywordsList = JSON.stringify(keywordArr.slice(0, 5));
    });
}

/**
 * Retrieves custom object storage for recent keywords
 * @returns {Array} - recent keywords
 */
function getRecentKeywords() {
    var keywordsCustObj = getObject(RECENT_KEYWORDS, KEYWORD);
    var keywords = keywordsCustObj.custom.keywordsList;
    if (keywords) {
        return JSON.parse(keywords);
    }
    Logger.debug('No recent keywords');
    return [];
}

/**
 * Get movie search results
 * @param  {Object} form - search form
 * @return {Array} - search results object containing movie names and youtube results
 */
function getSearchResults(form) {
    var results = [];
    if (form && form.keyword) {
        var searchMoviesReqObj;
        var searchMoviesResponse;
        var movieResults;
        if (form.adSearch === 'false') {
            searchMoviesReqObj = {
                movieName: encodeURI(form.keyword),
                serviceConstant: IMDBServiceConstants.SERVICES.MOVIE_DETAILS.ID
            };
            searchMoviesResponse = IMDBServiceHelper.makeCall(searchMoviesReqObj);
            if (searchMoviesResponse && searchMoviesResponse.ok && searchMoviesResponse.object) {
                movieResults = JSON.parse(searchMoviesResponse.object.text);
                if (movieResults.results) {
                    updateCustomObjectWithIMDBValues(movieResults.results);
                    results = movieResults.results;
                }
            }
        } else {
            var genres = form.genres ? JSON.parse(form.genres) : '';
            var params = 'title=' + encodeURI(form.keyword);
            params += form.language ? '&languages=' + form.language : '';
            params += form.releaseYear ? '&release_date=' + form.releaseYear + '-01-01,' + (parseInt(form.releaseYear, 10) + 1).toString() + '-01-01' : '';
            params += genres.length > 0 ? '&genres=' + genres.join(',') : '';
            searchMoviesReqObj = {
                params: params,
                serviceConstant: IMDBServiceConstants.SERVICES.ADVANCED_SEARCH.ID
            };
            searchMoviesResponse = IMDBServiceHelper.makeCall(searchMoviesReqObj);
            if (searchMoviesResponse && searchMoviesResponse.ok && searchMoviesResponse.object) {
                movieResults = JSON.parse(searchMoviesResponse.object.text);
                updateCustomObjectWithIMDBValues(movieResults.results);
                updateRecentKeywords(form.keyword);
                results = movieResults.results;
            }
        }
        if (form.quickSearch !== 'true') updateRecentKeywords(decodeURI(form.keyword));
    }

    Logger.debug('Keyword is empty');
    return results;
}

/**
 * Get movie trailer video embedHTML string
 * @param  {string} imdbId - imdb id
 * @param  {string} width - width of modal
 * @return {Object} - object containing movie trailer video embedHTML string
 */
function getVideo(imdbId, width) {
    var videoDetails = {
        success: false,
        embedHTML: '',
        errorMessage: Resource.msg('error.movie.notfound', 'movie', null)
    };
    var movieObj = getObject(MOVIES_MAP, imdbId);
    if (hasYoutubeVideo(movieObj)) {
        var embedHTML = (width === '250') ?
                        movieObj.custom.embedHTML.replace('width="650" height="366"', 'width="250" height="141"') :
                        movieObj.custom.embedHTML.replace('width="250" height="141"', 'width="650" height="366"');
        return {
            success: true,
            embedHTML: embedHTML,
            title: movieObj.custom.title + ' ' + movieObj.custom.description,
            fbShareUrl: FB_SHARE_URL + movieObj.custom.videoURL,
            tweetUrl: TWEET_URL + movieObj.custom.videoURL
        };
    }
    var getVideoDetailsReqObj = {
        imdbId: imdbId,
        serviceConstant: IMDBServiceConstants.SERVICES.VIDEO_DETAILS.ID
    };
    var getMovieDetailsResponse = IMDBServiceHelper.makeCall(getVideoDetailsReqObj);
    if (getMovieDetailsResponse && getMovieDetailsResponse.ok && getMovieDetailsResponse.object) {
        var movieDetails = JSON.parse(getMovieDetailsResponse.object.text);
        if (movieDetails.errorMessage.length === 0 && movieDetails.videoId) {
            if (!isMovieExisting(movieObj)) {
                var arr = new Array(movieDetails);
                updateCustomObjectWithIMDBValues(arr);
            }
            var playerdetailsReqObj = {
                videoId: movieDetails.videoId,
                width: width,
                serviceConstant: YoutubeServiceConstants.SERVICES.PLAYER_DETAILS.ID
            };
            var playerdetailsResponse = YoutubeServiceHelpers.makeCall(playerdetailsReqObj);
            if (playerdetailsResponse && playerdetailsResponse.ok && playerdetailsResponse.object) {
                var playerDetails = JSON.parse(playerdetailsResponse.object.text);
                if (playerDetails.items.length > 0 && playerDetails.items[0].player && playerDetails.items[0].player.embedHtml) {
                    videoDetails.embedHTML = playerDetails.items[0].player.embedHtml;
                    videoDetails.success = true;
                    videoDetails.title = movieObj.custom.title ? movieObj.custom.title : movieDetails.title + ' ' + (movieObj.custom.description ? movieObj.custom.description : movieDetails.year);
                    videoDetails.fbShareUrl = movieDetails.videoUrl ? FB_SHARE_URL + movieDetails.videoUrl : '';
                    videoDetails.tweetUrl = movieDetails.videoUrl ? TWEET_URL + movieDetails.videoUrl : '';
                    updateCustomObjectWithYoutubeValues(imdbId, playerdetailsReqObj.videoId, videoDetails.embedHTML, movieDetails.videoUrl);
                }
            }
        }
    }

    return videoDetails;
}

/**
 * Get Top movies result from cache
 * @param {string} key - cache key
 *
 * @return {Object} - value
 */
function getTopMoviesFromCache(key) {
    var value = false;
    try {
        value = cacheHelpers.getCache(key);
    } catch (e) {
        Logger.error('Movie cache not valid');
    }
    return value;
}

/**
 * Get Top movies result from cache
 * @param {string} key - cache key
 * @param {Object} value - cache key
 *
 * @return {undefined} - value
 */
function loadTopMoviesFromCache(key, value) {
    try {
        cacheHelpers.loadCache(key, value);
    } catch (e) {
        Logger.error('Movie cache not valid');
    }
}

/**
 * Get top 10 movies movie trailer video embedHTML string
 * @return {Object} - object containing movie trailer video embedHTML string
 */
function getTop25Movies() {
    var top25Movies = getTopMoviesFromCache(TOP_25_MOVIES);
    if (!top25Movies) {
        top25Movies = [];
        var getTop250MoviesReqObj = {
            serviceConstant: IMDBServiceConstants.SERVICES.TOP_250.ID
        };
        var getTop250MoviesResponse = IMDBServiceHelper.makeCall(getTop250MoviesReqObj);
        if (getTop250MoviesResponse && getTop250MoviesResponse.ok && getTop250MoviesResponse.object) {
            var topMoviesDetails = JSON.parse(getTop250MoviesResponse.object.text);
            if (topMoviesDetails.errorMessage.length === 0 && topMoviesDetails.items.length > 0) {
                top25Movies = topMoviesDetails.items.slice(0, 25);
                loadTopMoviesFromCache(TOP_25_MOVIES, top25Movies);
                updateCustomObjectWithIMDBValues(top25Movies);
            }
        }
    } else {
        updateCustomObjectWithIMDBValues(top25Movies);
    }
    return top25Movies;
}

/**
 * Get supported languages for search
 * @return {Array} - Array of objects language id : language name
 */
function getSupportedLanguages() {
    var supportedLanguages = system.System.getPreferences().custom.supportedLanguages;
    if (supportedLanguages && supportedLanguages.length > 0) {
        var results = [];
        supportedLanguages.forEach(function (lang) {
            var langSplit = lang.split(':');
            results.push({ id: langSplit[0], value: langSplit[1] });
        });
        return results;
    }
    Logger.info('No Supported Language found');
    return [];
}

/**
 * Get Search home page data
 * @return {Object} - Search home page data
 */
function getSearchPageData() {
    var recentKeywords = getRecentKeywords();
    var top25Movies = getTop25Movies();
    var supportedLanguages = getSupportedLanguages();
    return {
        top25Movies: top25Movies,
        recentKeywords: recentKeywords,
        supportedLanguages: supportedLanguages,
        genres: system.System.getPreferences().custom.genres
    };
}

/**
 * update trailer requests
 * @param {Object} form - form data
 * @return {Object} - Search home page data
 */
function updateRequest(form) {
    var trailerForm = getObject(REQUEST_TRAILER_FORM, form.movieName);
    if (!trailerForm.custom.movieName) {
        Transaction.wrap(function () {
            trailerForm.custom.movieName = form.movieName;
            trailerForm.custom.releasedYear = form.movieYear ? form.movieYear : '';
        });
        return Resource.msg('label.submit.request.success', 'movie', null);
    }
    return Resource.msg('label.submit.request.exists', 'movie', null);
}

module.exports = {
    getSearchResults: getSearchResults,
    getVideo: getVideo,
    getSearchPageData: getSearchPageData,
    updateRequest: updateRequest
};
