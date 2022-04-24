'use strict';

var scrollAnimate = require('base/components/scrollAnimate');

/**
 * search movies ajax
 * @param {string} keyword - recent search keyword
 * @returns {Object} - object
 */
function getFormData(keyword) {
    var form = {
        keyword: keyword
    };
    var adSearch = $('#advancedSearch').prop('checked');
    if (adSearch) {
        var language = $('#languagesDropdownButton').val();
        var genres = [];
        $('.genre-checkbox:checked').each(function () {
            genres.push($(this).data('value'));
        });
        var releaseYear = $('#releaseYear').val();
        form.adSearch = true;
        form.language = language;
        form.genres = JSON.stringify(genres);
        form.releaseYear = releaseYear;
    } else {
        form.adSearch = false;
    }
    return form;
}

/**
 * search movies ajax
 * @param {string} keyword - recent search keyword
 * @param {boolean} quickSearch - quick search
 * @returns {undefined}
 */
function searchMovies(keyword, quickSearch) {
    var url = $('.bt-search-movies').data('url');
    var form;
    if (quickSearch) {
        form = {
            keyword: keyword,
            adSearch: false,
            quickSearch: true
        };
    } else {
        form = getFormData(keyword, quickSearch);
    }
    $.ajax({
        url: url,
        type: 'POST',
        data: form,
        success: function (data) {
            $('.recents').hide();
            $('.searchresults-container').html(data);
            $.spinner().stop();
        },
        error: function () {
            $.spinner().stop();
        }
    });
}

/**
 * Clears advanced search options
 */
function clearAdvSearchOptions() {
    $('#releaseYear').val('');
    $('.genre-checkbox:checked').prop('checked', false);
    $('.lang-dropdown').find('button').text('Select Language').val('');
}

module.exports = {
    searchMovie: function () {
        var typingTimer;
        var doneTypingInterval = 1500;
        $('#searchMovie').data('stopex', false);
        $('#movieForm').on('submit', function (e) {
            e.preventDefault();
            $('#searchMovie').data('stopex', true);
            var keyword = encodeURI($('#searchMovie').val());
            $.spinner().start();
            searchMovies(keyword, false);
            return false;
        });

        $('.badge.keyword').on('click', function () {
            var keyword = $(this).data('value');
            $('#searchMovie').val(keyword);
            $.spinner().start();
            searchMovies(encodeURI(keyword), true);
        });

        $('#searchMovie').on('keyup', function (e) {
            if ($('#searchMovie').val().length > 0) {
                if (e.keyCode !== 13) $('#searchMovie').data('stopex', false);
                $('#searchMovie').removeClass('is-invalid');
                if ($('#searchMovie').val().length >= 3 && $('#advancedSearch').prop('checked') === false) {
                    clearTimeout(typingTimer);
                    doneTypingInterval = 3000;
                    typingTimer = setTimeout(function () {
                        if (!$('#searchMovie').data('stopex')) {
                            var keyword = encodeURI($('#searchMovie').val());
                            searchMovies(keyword, true);
                        }
                    }, doneTypingInterval);
                    return true;
                }
            }
            return true;
        });

        $('#searchMovie').on('keydown', function () {
            clearTimeout(typingTimer);
        });

        $('.clear-results').on('click', function () {
            $('.recents').show();
            $('.searchresults-container').empty();
            $('#searchMovie').val('').removeClass('is-invalid');
            clearAdvSearchOptions();
        });

        $('.movies-container').on('click', '.playvideo', function (e) {
            e.preventDefault();
            var elem = $(this);
            if (!elem.hasClass('novideo')) {
                var imdbId = elem.data('imdbid');
                var width = 700;
                if (screen.width <= 450) {
                    width = 250;
                } else if (screen.width <= 768) {
                    width = 650;
                }
                var url = $('.bt-search-movies').data('fetch-video') + '?imdbId=' + imdbId + '&width=' + width;
                $.spinner().start();
                $.ajax({
                    url: url,
                    type: 'GET',
                    success: function (data) {
                        if (data.videoDetails.success) {
                            $('#movieTrailerModal').find('.modal-body').empty().append(data.videoDetails.embedHTML);
                            $('#movieTrailerModal').find('.modal-title').text(data.videoDetails.title).show();
                            if (data.videoDetails.fbShareUrl && data.videoDetails.tweetUrl) {
                                $('.btn-fb').attr('url', data.videoDetails.fbShareUrl);
                                $('.btn-twitter').attr('url', data.videoDetails.tweetUrl);
                                $('#movieTrailerModal').find('.modal-footer').show();
                            } else {
                                $('#movieTrailerModal').find('.modal-footer').hide();
                            }
                            $('#movieTrailerModal').modal('show');
                        } else if (elem.closest('.owl-item').length === 0) {
                            elem.text(data.videoDetails.errorMessage).addClass('novideo');
                            elem.append('<a href="#requestTrailer" class="requestTrailer">Click here </a>to request for a movie trailer');
                        }
                        $.spinner().stop();
                    },
                    error: function () {
                        $.spinner().stop();
                    }
                });
            }
            return false;
        });

        $('.movies-container').on('click', '.requestTrailer', function (e) {
            e.preventDefault();
            scrollAnimate($('#requestTrailer'));
        });

        $('.btn-share').on('click', function () {
            var url = $(this).attr('url');
            if (url) {
                window.open(url, '_blank').focus();
            }
        });

        $('#advancedSearch').on('change', function () {
            if ($(this).prop('checked')) {
                $('.advanced-search-menu').removeClass('d-none');
            } else {
                $('.advanced-search-menu').addClass('d-none');
                clearAdvSearchOptions();
            }
        });

        $('.lang-dropdown').on('click', '.dropdown-item', function () {
            var elem = $(this);
            var value = elem.data('value');
            var text = elem.text().trim();
            elem.closest('.lang-dropdown').find('button').text(text).val(value);
            elem.closest('.dropdown-menu').removeClass('show');
        });

        $('#movieTrailerModal').on('hidden.bs.modal', function () {
            $('#movieTrailerModal').find('.modal-body').empty();
        });

        $('.owl-carousel').owlCarousel({
            loop: true,
            margin: 10,
            items: 6,
            lazyLoad: true,
            animateOut: 'fadeOut',
            autoplay: true,
            autoplayTimeout: 2500,
            autoplayHoverPause: true,
            responsiveClass: true,
            responsive: {
                0: {
                    items: 2
                },
                768: {
                    items: 4
                },
                1440: {
                    items: 6
                }
            }
        });

        $('#movieRequestForm').on('submit', function (e) {
            e.preventDefault();
            $.spinner().start();
            $.ajax({
                url: $(this).attr('action'),
                type: 'POST',
                data: $(this).serialize(),
                success: function (data) {
                    $('#movieReqMsg').text(data.resp).show().fadeOut(2500, 'linear');
                    $.spinner().stop();
                },
                error: function () {
                    $.spinner().stop();
                }
            });
        });
    }
};
