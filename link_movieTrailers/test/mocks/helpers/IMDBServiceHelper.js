'use strict';

module.exports = {
    makeCall: function (target) {
        return {
            ok: true,
            object: {
                text: JSON.stringify({ results: ['movie'], items: ['item'], errorMessage: '' })
            }
        };
    }
};
