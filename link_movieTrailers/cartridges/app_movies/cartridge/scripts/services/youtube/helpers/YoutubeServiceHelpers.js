'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var system = require('dw/system');
var logger = require('dw/system/Logger');

var YoutubeServiceConstants = require('*/cartridge/scripts/services/youtube/common/YoutubeServiceConstants');

var YoutubeService = {};

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
 * Method to Get Service callback for fetching video details from Youtube API
 *
 * @returns {dw.svc.LocalServiceRegistry} Service call back
 */
function getPlayerDetails() {
    var playerDetails = getBaseServiceCallBack();
    playerDetails.createRequest = function (service, args) {
        var apiKey = system.System.getPreferences().custom.youtubeAPIKey;
        var maxResults = system.System.getPreferences().custom.maxResults;
        service.setRequestMethod(YoutubeServiceConstants.SERVICES[args.serviceConstant].METHOD);
        service.URL = service.URL.replace('{API_KEY}', apiKey);   // eslint-disable-line
        service.URL = service.URL.replace('{MAX_RESULTS}', maxResults);   // eslint-disable-line
        service.URL = service.URL.replace('{PART}', YoutubeServiceConstants.SERVICES[args.serviceConstant].PART);   // eslint-disable-line
        service.URL += '&id=' + args.videoId + '&maxWidth=' + args.width;   // eslint-disable-line
        return null;
    };
    playerDetails.parseResponse = function (service, response) {
        /* Parse response utils */
        return response;
    };
    return LocalServiceRegistry.createService('youtube.rest.listvideos', playerDetails);
}

/**
 * Method for calling IMDB service.
 *
 * @param {Object} args Object contain movie search attributes
 * @returns {Object} service response
 */
YoutubeService.makeCall = function (args) {
    var returnResp;
    try {
        var service = getPlayerDetails();
        returnResp = service.call(args);
    } catch (e) {
        // Set generic error response
        logger.error('[YoutubeServiceHelpers-makeCall] Error while calling service for fetching details of youtube player {0} with message: {1}', [args.videoId, e.message]);
    }
    return returnResp;
};

module.exports = YoutubeService;
