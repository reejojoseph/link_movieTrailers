var LocalServiceRegistry = {
    createService: function (serviceID, details) {
        return {
            call: function (args) {
                var result;
                switch (args.serviceConstant) {
                    case 'MOVIE_DETAILS':
                        result = 'MOVIE_DETAILS';
                        break;
                    case 'VIDEO_DETAILS':
                        result = 'VIDEO_DETAILS';
                        break;
                    case 'TOP_250':
                        result = 'TOP_250';
                        break;
                    case 'ADVANCED_SEARCH':
                        result = 'ADVANCED_SEARCH';
                        break;
                    case 'PLAYER_DETAILS':
                        result = 'PLAYER_DETAILS';
                        break;
                    default:
                        result = 'default';
                        break;
                }
                return result;
            }
        };
    }
};

module.exports = LocalServiceRegistry;
