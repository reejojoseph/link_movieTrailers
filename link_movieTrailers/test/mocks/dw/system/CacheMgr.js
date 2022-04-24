var CacheMgr = {
    getCache: function (key, cache) {
        return {
            put: function (key, value) { },
            get: function (key) {
                return true;
            }
        };
    },
    loadCache: function (key, value, cache) { }
};

module.exports = CacheMgr;
