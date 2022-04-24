'use strict';

var CacheMgr = require('dw/system/CacheMgr');
var movieCache = 'movieCache';
var Logger = require('dw/system/Logger');

/**
 * Load RMW cache
 * @param {string} key - cache key
 * @param {Object} value - value
 * @param {string} cache - cache id
 * @return {undefined}
 */
function loadCache(key, value, cache) {
    var cacheID = cache || movieCache;
    var moviesCacheEntry = CacheMgr.getCache(cacheID);
    moviesCacheEntry.put(key, value);
}

/**
 * Get RMW cache
 * @param {string} key - cache key
 * @param {string} cache - cache id
 * @return {Object} - value present in cache
 */
function getCache(key, cache) {
    var cacheID = cache || movieCache;
    try {
        var moviesCacheEntry = CacheMgr.getCache(cacheID);
        return moviesCacheEntry.get(key);
    } catch (e) {
        Logger.error(cacheID + ' cache is not defined or enabled.');
        return false;
    }
}

module.exports = {
    loadCache: loadCache,
    getCache: getCache
};
