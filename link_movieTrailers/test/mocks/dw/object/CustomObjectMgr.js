var CustomObjectMgr = {
    getCustomObject: function (customObjectName, customObjectKey) {
        return {
            custom: {
                videoID: 'videoID',
                embedHTML: 'embedHTML',
                keywordsList: JSON.stringify(['keywordsList']),
                title: 'title',
                description: 'description',
                image: 'image',
                videoURL: 'videoURL'
            }
        };
    },
    createCustomObject: function (customObjectName, customObjectKey) {
        return {
            custom: {
                videoID: 'videoID',
                embedHTML: 'embedHTML',
                keywordsList: JSON.stringify(['keywordsList']),
                title: 'title',
                description: 'description',
                image: 'image',
                videoURL: 'videoURL'
            }
        };
    }
};

module.exports = CustomObjectMgr;
