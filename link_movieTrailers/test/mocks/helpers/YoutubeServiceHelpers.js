'use strict';

module.exports = {
    makeCall: function (target) {
        return {
            ok: true,
            object: {
                text: JSON.stringify({ errorMessage: '', videoId: '', title: 'movie', videoUrl: 'videoUrl', items: [{ player: { embedHtml: 'embedHtml' } }] })
            }
        };
    }
};
