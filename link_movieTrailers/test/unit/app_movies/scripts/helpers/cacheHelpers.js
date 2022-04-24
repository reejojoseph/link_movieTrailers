var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var cacheHelpers;

describe('Cache Helpers', function () {
    before(function () {
        cacheHelpers = proxyquire('../../../../../cartridges/app_movies/cartridge/scripts/helpers/cacheHelpers', {
            'dw/system/CacheMgr': require('../../../../mocks/dw/system/CacheMgr'),
            'dw/system/Logger': require('../../../../mocks/dw/system/Logger')
        });
    });

    it('Validate Load cache', function () {
        cacheHelpers.loadCache('key', 'value', 'cache');
    });

    it('Validate Get cache', function () {
        var details = cacheHelpers.getCache('key', 'cache');
        assert.deepEqual(true, details);
    });
});
