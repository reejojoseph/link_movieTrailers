'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var system = require('dw/system');
var logger = require('dw/system/Logger');

var IMDBServiceConstants = require('*/cartridge/scripts/services/imdb/common/IMDBServiceConstants');

var IMDBService = {};

/**
 * Base Service call back Method.
 *
 * @returns {Object} baseServiceCallback
 */
function getBaseServiceCallBack() {
    var baseServiceCallback = {
        createRequest: function (service, args) {
            return args;
        },
        filterLogMessage: function (msg) {
            return msg;
        },
        parseResponse: function (service, response) {
            return response;
        }
    };
    return baseServiceCallback;
}

/**
 * Method to Get Service callback for fetching movie details from IMDB API
 *
 * @returns {dw.svc.LocalServiceRegistry} Service call back
 */
function getMovieDetails() {
    var movieDetails = getBaseServiceCallBack();
    movieDetails.createRequest = function (service, args) {
        var apiKey = system.System.getPreferences().custom.imdbAPIKey;
        service.setRequestMethod(IMDBServiceConstants.SERVICES[args.serviceConstant].METHOD);
        service.URL = service.URL.replace('{API_KEY}', apiKey);   // eslint-disable-line
        service.URL = service.URL.replace('{MOVIE_NAME}', args.movieName);   // eslint-disable-line
        return null;
    };
    movieDetails.parseResponse = function (service, response) {
        /* Parse response utils */
        return response;
    };
    return LocalServiceRegistry.createService('imdb.rest.searchmovies', movieDetails);
}

/**
 * Method to Get Service callback for fetching movie details from IMDB API
 *
 * @returns {dw.svc.LocalServiceRegistry} Service call back
 */
function getVideoDetails() {
    var videoDetails = getBaseServiceCallBack();
    videoDetails.createRequest = function (service, args) {
        var apiKey = system.System.getPreferences().custom.imdbAPIKey;
        service.setRequestMethod('GET');
        service.URL = service.URL.replace('{API_KEY}', apiKey);   // eslint-disable-line
        service.URL = service.URL.replace('{IMDB_ID}', args.imdbId);   // eslint-disable-line
        return null;
    };
    videoDetails.parseResponse = function (service, response) {
        /* Parse response utils */
        return response;
    };
    return LocalServiceRegistry.createService('imdb.rest.getvideodetails', videoDetails);
}

/**
 * Method to Get Service callback for fetching top 50 IMDb movie details from IMDb API
 *
 * @returns {dw.svc.LocalServiceRegistry} Service call back
 */
function getTop250Movies() {
    var topMovies = getBaseServiceCallBack();
    topMovies.createRequest = function (service, args) {   // eslint-disable-line
        var apiKey = system.System.getPreferences().custom.imdbAPIKey;
        service.setRequestMethod('GET');
        service.URL = service.URL.replace('{API_KEY}', apiKey);   // eslint-disable-line
        return null;
    };
    topMovies.parseResponse = function (service, response) {
        /* Parse response utils */
        return response;
    };
    return LocalServiceRegistry.createService('imdb.rest.gettop50', topMovies);
}

/**
 * Method to Get Service callback for fetching movie details from IMDB API
 *
 * @returns {dw.svc.LocalServiceRegistry} Service call back
 */
function getAdvancedSearchResults() {
    var movieDetails = getBaseServiceCallBack();
    movieDetails.createRequest = function (service, args) {
        var apiKey = system.System.getPreferences().custom.imdbAPIKey;
        service.setRequestMethod(IMDBServiceConstants.SERVICES[args.serviceConstant].METHOD);
        service.URL = service.URL.replace('{API_KEY}', apiKey);   // eslint-disable-line
        service.URL += args.params;   // eslint-disable-line
        return null;
    };
    movieDetails.parseResponse = function (service, response) {
        /* Parse response utils */
        return response;
    };
    return LocalServiceRegistry.createService('imdb.rest.advancedsearch', movieDetails);
}

/**
 * Method to get the IMDB service callback as per the service constant.
 *
 * @param {string} serviceConstant service constant
 * @returns {Object} Service call back
 */
function getService(serviceConstant) {
    switch (serviceConstant) {
        case IMDBServiceConstants.SERVICES.MOVIE_DETAILS.ID:
            return getMovieDetails();
        case IMDBServiceConstants.SERVICES.VIDEO_DETAILS.ID:
            return getVideoDetails();
        case IMDBServiceConstants.SERVICES.TOP_250.ID:
            return getTop250Movies();
        case IMDBServiceConstants.SERVICES.ADVANCED_SEARCH.ID:
            return getAdvancedSearchResults();
        default:
            logger.error('[IMDBServiceHelpers-makeCall] No service callback object found for constant {0}', [serviceConstant]);
            return null;
    }
}

/**
 * Method for calling IMDB service.
 *
 * @param {Object} args Object contain movie search attributes
 * @returns {Object} service response
 */
IMDBService.makeCall = function (args) {
    var returnResp;
    try {
        var service = getService(args.serviceConstant);
        returnResp = service.call(args);
    } catch (e) {
        // Set generic error response
        logger.error('[IMDBServiceHelpers-makeCall] Error while calling service for fetching details of movie {0} with message: {1}', [args.movieName, e.message]);
    }
    return returnResp;
};

module.exports = IMDBService;
