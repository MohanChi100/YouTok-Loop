var youtubePlayers = [];
var videoIDs = [];
var like_count_list = [];
var comment_count_list = [];
var gesture_swipe = 'swipe';
var gesture_loop = 'loop';
var isLoop = false;
var initial_time = '';
var currentIndex = 0;
var resultCount = 50;
var playerAppend = 10;

// swiper = new Swiper('.swiper-container', {
//     direction: "vertical",
//     // pagination: {
//     //     el: '.swiper-pagination',
//     // },
//     navigation: {
//         // nextEl: '.swiper-button-next',
//         // prevEl: '.swiper-button-prev',
//     },
// });
function getQueryParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Get the username from the URL parameter
var username = getQueryParam('username');

var test_uid = username || 'participant_test';

// var videoIDs = [
//     'bg4I_NtOshE', 'Ksg6khWeCL8', 'WMv-yaE4YVg', 'cJVHSBr88o4', '_bFK2d5UDoc',
//     'Pb5UdTEh0l0', 'cugxnHLKo_Y', 'yhZTgFp4uDs', 'tex8V4he3AI', 'l3Y1sWE_Yr8',
// ];
// var youtube_api_key = 'AIzaSyAjSa4cR1Li5cWtE3jChY8piErqi0USjqM'

function currentDate() {
    var d = new Date;
    var dformat = [
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
    ].join('-') + ' ' +
        [
            d.getHours(),
            d.getMinutes(),
            d.getSeconds()
        ].join(':');
    return dformat;
}

function postWatchTime(vid, time, isStart, isSwipe) {
    var fd = new FormData();
    fd.append('uid', test_uid);
    fd.append('vid', vid);
    if (isStart) {
        fd.append('start_time', currentDate());
        if (isSwipe) {
            fd.append('start_how', gesture_swipe);
        }
        else {
            fd.append('start_how', gesture_loop);
        }
    }
    else {
        fd.append('end_time', currentDate());
        if (isSwipe) {
            fd.append('end_how', gesture_swipe);
        }
        else {
            fd.append('end_how', gesture_loop);
        }
    }
    $.ajax({
        url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
        data: fd,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data) {
            console.log('Store time in the database: ' + vid + ' ---- ' + currentDate())
        }
    });
}

function postPauseTime(uid, vid, is_pause, time) {
    var fd = new FormData();
    fd.append('uid', uid);
    fd.append('vid', vid);
    fd.append('is_pause', is_pause);
    fd.append('time', time);

    $.ajax({
        url: 'https://youtok-api.momochi.me/SavePauseData',
        data: fd,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data) {
            console.log('Store pause time in the database!')
        }
    });
}

function onYouTubeIframeAPIReady() {
    let w = '100%';
    let h = '100%';

    console.log('iframe ready');
    for (let i = 0; i < playerAppend && i < videoIDs.length; i++) {
        id = videoIDs[i];
        var events = {
                    onStateChange: onPlayerStateChange,
                };
               if (i === 0) {
            events = {
                ...events,
                onReady: onPlayerReady,
            };
        }
            const newPlayer = new YT.Player(`player-${i}`, {
                width: w,
                height: h,
                videoId: id,
                playerVars: {
                    rel: 0,
                    showinfo: 0,
                    controls: 0,
                    playsinline: 1,
                    modestbranding: 1,
                },
                events: events,
            });

            youtubePlayers.push(newPlayer);
        }
    

    // youtubePlayers = videoIDs.map((id, i) => {
    //     console.log('video ID : ' + videoIDs[i]);
    //     var events = {
    //         onStateChange: onPlayerStateChange,
    //     };
    //     if (i === 0) {
    //         events = {
    //             ...events,
    //             onReady: onPlayerReady,
    //         };
    //     }

    //     return new YT.Player(`player-${i}`, {
    //         width: w,
    //         height: h,
    //         videoId: id,
    //         playerVars: {
    //             rel: 0, // Set rel=0 to disable related videos when the player starts.
    //             showinfo: 0,
    //             controls: 0,
    //             playsinline: 1,
    //             modestbranding: 1,
    //         },
    //         events: events,
    //     });
    // });
}

function onPlayerStateChange(e) {
    console.log(e.data)
    if (e.data === YT.PlayerState.ENDED) {
        // e.target.playVideo();
        console.log('ENDDDDDDD!!!!!!!!!index:' + currentIndex);
        postWatchTime(videoIDs[currentIndex], currentDate(), false, false);
        postWatchTime(videoIDs[currentIndex + 1], currentDate(), true, false);
        isLoop = true;
        swiper.slideNext();
    }
}

function onPlayerReady(event) {
    // event.target.mute();
    event.target.playVideo();
    setTimeout(function () {
        event.target.playVideo();
    }, 3000);
}

function showCommentList(vid) {
    $.ajax({
        url: 'https://youtok-api.momochi.me/GetVideoComment',
        data: { 'vid': vid },
        type: 'GET',
        success: function (data) {
            // Assuming data is an array of comments
            var commentList = data;

            var commentHTML = '';
            commentList.forEach(function (comment, index) {
                // commentHTML += '<li class="comment-item">' + comment + '</li>';
                commentHTML += '<li class="comment-item">' +
                    '<div class="comment-header">' +
                    '<img src="' + comment.profile_image_url + '" alt="Profile Photo" class="profile-photo">' +
                    '<span class="author-name">' + comment.author_name + '  ' + comment.publish_date + '</span>' +
                    '</div>' +
                    '<div class="comment-text">' + comment.comment + '</div>' +
                    '<div class="like-section">' +
                    '<img src="img/like.svg" alt="Like" class="like-icon">' +
                    '<span class="like-count">' + comment.like_count + '      </span>' +
                    '<img src="img/dislike.svg" alt="Dislike" class="other-icon">' +
                    '<img src="img/comment.svg" alt="Comment" class="other-icon">' +
                    '</div>' +
                    '</li>';
            });

            // Add a text input section for comments
            commentHTML += '<div class="comment-input-section">' +
                '<input type="text" id="comment-input" placeholder="Type your comment">' +
                '<button id="comment-submit">' +
                '<img src="img/send.svg" alt="Submit">' +
                '</button>' +
                '</div>';

            $('#comment-list').html(commentHTML);

            $('#commentModal').modal('show');

            $('#comment-submit').click(function () {
                var commentText = $('#comment-input').val();
                if (commentText) {
                    var fd = new FormData();
                    fd.append('uid', test_uid);
                    fd.append('vid', vid);
                    fd.append('new_comment', commentText);
                    $.ajax({
                        url: 'https://youtok-api.momochi.me/SaveUserNewComment',
                        data: fd,
                        processData: false,
                        contentType: false,
                        type: 'POST',
                        success: function (data) {
                            console.log('Store a new comment in the database!!!!!')
                        }
                    });
                }
                $('#comment-input').val('');
            });
        },
        error: function (xhr, status, error) {
            console.log('Error:', error);
        }
    });
}

//websocket io
const socket = io('https://youtok-api.momochi.me');

window.addEventListener('beforeunload', function (event) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://youtok-api.momochi.me/notify_disconnect', false);
    xhr.send();
});
window.addEventListener('unload', () => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://youtok-api.momochi.me/notify_disconnect', true);
    xhr.send();
});

//-------------survey!!!!!!!-------------//
// window.onbeforeunload = function () {
//     console.log('here');
//     window.document.getElementById('survey').innerHTML =
//         'before you leave, please take our short survey <a href="https://qfreeaccountssjc1.az1.qualtrics.com/jfe/form/SV_6QjCKvNkyZkuQyq">Questionnair Link</a>';
//     return "Are you sure?";
// };

// var publishedAfter = '2023-08-20T00:00:00Z';
// var publishedBefore = '2023-08-27T00:00:00Z';
var QueryVideoByUID_url = 'https://youtok-api.momochi.me/QueryVideoByUID';
QueryVideoByUID_url += '?uid=' + encodeURIComponent(test_uid);
// QueryVideoByUID_url += '&publishedAfter=' + encodeURIComponent(publishedAfter);
// QueryVideoByUID_url += '&publishedBefore=' + encodeURIComponent(publishedBefore);
QueryVideoByUID_url += '&resultCount=' + encodeURIComponent(resultCount);

function addMoreVideos() {
    let w = '100%';
    let h = '100%';
    $.ajax({
        url: QueryVideoByUID_url,
        type: 'GET',
        success: function (data) {
            console.log(data);
            videoIDs = data["video_id_list"];
            like_count_list = data['likeCount_list'];
            comment_count_list = data['commentCount_list'];
            
            console.log('video id list: ' + videoIDs);
            console.log('Number of videos:', videoIDs.length);

            const startIndex = youtubePlayers.length;

            videoIDs.forEach((id, i) => {

                swiper.appendSlide(`
                <div class="swiper-slide">
                    <div class="actions">
                        <img id="like-${i + startIndex}" src="img/like.svg" />
                        <p>${like_count_list[i+ startIndex]}</p>
                        <img id="dislike-${i + startIndex}" src="img/dislike.svg" />
                        <img id="comment-${i + startIndex}" src="img/comment.svg" />
                        <p>${comment_count_list[i+ startIndex]}</p>
                        <img id="share-${i + startIndex}" src="img/share.svg" />
                    </div>
                    <div id="overlay-${i + startIndex}" class="overlay"></div>
                    <div id="player-${i + startIndex}"></div>
                </div>
            `);
                const newPlayer = new YT.Player(`player-${i + startIndex}`, {
                    width: w,
                    height: h,
                    videoId: id,
                    playerVars: {
                        rel: 0,
                        showinfo: 0,
                        controls: 0,
                        playsinline: 1,
                        modestbranding: 1,
                    },
                    events: {
                        onStateChange: onPlayerStateChange,
                    },
                });
                youtubePlayers.push(newPlayer);
                // $('.swiper-wrapper').append(`
                //     <div class="swiper-slide">
                //         <div class="actions">
                //             <img id="like-${i + startIndex}" src="img/like.svg" />
                //             <img id="dislike-${i + startIndex}" src="img/dislike.svg" />
                //             <img id="comment-${i + startIndex}" src="img/comment.svg" />
                //             <img id="share-${i + startIndex}" src="img/share.svg" />
                //         </div>
                //         <div id="overlay-${i + startIndex}" class="overlay"></div>
                //         <div id="player-${i + startIndex}"></div>
                //     </div>
                // `);

                $(`#like-${i + startIndex}`).click(function () {
                    var self = this;
                    var fd = new FormData();
                    fd.append('uid', test_uid);
                    fd.append('vid', videoIDs[i]);
                    // fd.append( 'start_time', video_start_time);
                    // fd.append( 'end_time', currentDate());
                    // fd.append('start_how', gesture);
                    // fd.append('end_how', gesture);
                    fd.append('liked', $(this).attr('class') === 'active' ? 'false' : 'true');
                    fd.append('liked_datetime', currentDate());
                    //when clicking "like", unchecking "dislike"
                    $(this).attr('class') === 'active' ? 'false' : $(`#dislike-${i + startIndex}`).removeClass('active');
                    $.ajax({
                        url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
                        data: fd,
                        processData: false,
                        contentType: false,
                        type: 'POST',
                        success: function (data) {
                            $(self).toggleClass('active');
                        }
                    });
                });
                $(`#dislike-${i + startIndex}`).click(function () {
                    var self = this;
                    var fd = new FormData();
                    fd.append('uid', test_uid);
                    fd.append('vid', videoIDs[i]);
                    // fd.append( 'start_time', video_start_time);
                    // fd.append( 'end_time', currentDate());
                    // fd.append('start_how', gesture);
                    // fd.append('end_how', gesture);
                    fd.append('disliked', $(this).attr('class') === 'active' ? 'false' : 'true');
                    fd.append('disliked_datetime', currentDate());
                    //when clicking "dislike", unchecking "like"
                    $(this).attr('class') === 'active' ? 'false' : $(`#like-${i + startIndex}`).removeClass('active');

                    $.ajax({
                        url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
                        data: fd,
                        processData: false,
                        contentType: false,
                        type: 'POST',
                        success: function (data) {
                            $(self).toggleClass('active');
                        }
                    });
                });
                $(`#comment-${i + startIndex}`).click(function () {
                    // $(this).toggleClass('active');
                    showCommentList(videoIDs[i]);
                });
                $(`#share-${i + startIndex}`).click(function () {
                    var self = this;
                    var fd = new FormData();
                    fd.append('uid', test_uid);
                    fd.append('vid', videoIDs[i]);
                    // fd.append( 'start_time', video_start_time);
                    // fd.append( 'end_time', currentDate());
                    // fd.append('start_how', gesture);
                    // fd.append('end_how', gesture);
                    fd.append('share', $(this).attr('class') === 'active' ? 'false' : 'true');
                    fd.append('share_datetime', currentDate());

                    $.ajax({
                        url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
                        data: fd,
                        processData: false,
                        contentType: false,
                        type: 'POST',
                        success: function (data) {
                            $(self).toggleClass('active');
                        }
                    });
                });
                $(`#overlay-${i + startIndex}`).click(function () {
                    if (youtubePlayers[i + startIndex].getPlayerState() == YT.PlayerState.PAUSED) {
                        youtubePlayers[i + startIndex].playVideo();
                        postPauseTime(test_uid, videoIDs[i], 'false', currentDate())
                    }
                    else {
                        youtubePlayers[i + startIndex].pauseVideo();
                        postPauseTime(test_uid, videoIDs[i], 'true', currentDate())
                    }
                });
            })
            swiper.update();
        }
    })
}

function addMoreVideoPlayers() {
    let w = '100%';
    let h = '100%';
    const startIndex = youtubePlayers.length;
    console.log('@@@@@@@@@@@@addMoreVideoPlayers@@@@@@@@@@@@@@@');
    for (let i = startIndex; i < startIndex + playerAppend && i < videoIDs.length; i++) {
        id = videoIDs[i];
        swiper.appendSlide(`
                <div class="swiper-slide">
                <div class="actions">
                <img id="like-${i}" src="img/like.svg" />
                <p>${like_count_list[i]}</p>
                <img id="dislike-${i}" src="img/dislike.svg" />
                <p>Dislike</p>
                <img id="comment-${i}" src="img/comment.svg" />
                <p>${comment_count_list[i]}</p>
                <img id="share-${i}" src="img/share.svg" />
                <p>Share</p>
            </div>
                    <div id="overlay-${i}" class="overlay"></div>
                    <div id="player-${i}"></div>
                </div>
            `);


        const newPlayer = new YT.Player(`player-${i}`, {
            width: w,
            height: h,
            videoId: id,
            playerVars: {
                rel: 0,
                showinfo: 0,
                controls: 0,
                playsinline: 1,
                modestbranding: 1,
            },
            events: {
                onStateChange: onPlayerStateChange,
            },
        });

        youtubePlayers.push(newPlayer);

        $(`#like-${i}`).click(function () {
            var self = this;
            var fd = new FormData();
            fd.append('uid', test_uid);
            fd.append('vid', videoIDs[i]);
            // fd.append( 'start_time', video_start_time);
            // fd.append( 'end_time', currentDate());
            // fd.append('start_how', gesture);
            // fd.append('end_how', gesture);
            fd.append('liked', $(this).attr('class') === 'active' ? 'false' : 'true');
            fd.append('liked_datetime', currentDate());
            //when clicking "like", unchecking "dislike"
            $(this).attr('class') === 'active' ? 'false' : $(`#dislike-${i}`).removeClass('active');
            $.ajax({
                url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
                data: fd,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (data) {
                    $(self).toggleClass('active');
                }
            });
        });
        $(`#dislike-${i}`).click(function () {
            var self = this;
            var fd = new FormData();
            fd.append('uid', test_uid);
            fd.append('vid', videoIDs[i]);
            // fd.append( 'start_time', video_start_time);
            // fd.append( 'end_time', currentDate());
            // fd.append('start_how', gesture);
            // fd.append('end_how', gesture);
            fd.append('disliked', $(this).attr('class') === 'active' ? 'false' : 'true');
            fd.append('disliked_datetime', currentDate());
            //when clicking "dislike", unchecking "like"
            $(this).attr('class') === 'active' ? 'false' : $(`#like-${i}`).removeClass('active');

            $.ajax({
                url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
                data: fd,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (data) {
                    $(self).toggleClass('active');
                }
            });
        });
        $(`#comment-${i}`).click(function () {
            // $(this).toggleClass('active');
            showCommentList(videoIDs[i]);
        });
        $(`#share-${i}`).click(function () {
            var self = this;
            var fd = new FormData();
            fd.append('uid', test_uid);
            fd.append('vid', videoIDs[i]);
            // fd.append( 'start_time', video_start_time);
            // fd.append( 'end_time', currentDate());
            // fd.append('start_how', gesture);
            // fd.append('end_how', gesture);
            fd.append('share', $(this).attr('class') === 'active' ? 'false' : 'true');
            fd.append('share_datetime', currentDate());
            
            $.ajax({
                url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
                data: fd,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (data) {
                    $(self).toggleClass('active');
                }
            });
        });
        $(`#overlay-${i}`).click(function () {
            if (youtubePlayers[i].getPlayerState() == YT.PlayerState.PAUSED) {
                youtubePlayers[i].playVideo();
                postPauseTime(test_uid, videoIDs[i], 'false', currentDate())
            }
            else {
                youtubePlayers[i].pauseVideo();
                postPauseTime(test_uid, videoIDs[i], 'true', currentDate())
            }
        });

    }
    swiper.update();
}

function queryMoreVideos() {
    console.log('#################queryMoreVideos################');
    $.ajax({
        url: QueryVideoByUID_url,
        type: 'GET',
        success: function (data) {
            console.log(data);
            console.log('!!!!!!!!!!!!!!qurey videos!!!!!!!!!!!!!!!!!!!!!1 video id list: ' + data);
            console.log('Number of videos:', data["video_id_list"].length);
            data.forEach((id, i) => {
                videoIDs.push(data["video_id_list"][i]);
                like_count_list.push(data["likeCount_list"][i]);
                comment_count_list.push(data["commentCount_list"][i]);
            }
            )
            console.log('!!!!!!!!!!!!!!total videoids length:', videoIDs.length);
        }
    })
    
}

$.ajax({
    // url: 'https://youtok-api.momochi.me/GetLikeVideoList',
    // url: 'https://youtok-api.momochi.me/GetAllVideo',
    // url: 'https://youtok-api.momochi.me/GetVideoIDByCategory', //test_mode
    // url: 'https://youtok-api.momochi.me/GetLikeVideoListByCategory', //test_mode
    // url: 'https://youtok-api.momochi.me/GetLikeVideoListInLikeVideoTable',
    url: QueryVideoByUID_url,
    // data: {'uid': test_uid},
    // data: {'category': 10},
    type: 'GET',
    success: function (data) {
        console.log(data);
        videoIDs = data["video_id_list"];
        like_count_list = data['likeCount_list'];
        comment_count_list = data['commentCount_list'];
        console.log('like_count_list!!!!!!: ' + like_count_list);
        console.log('comment_count_list!!!!!!: ' + comment_count_list);
        console.log('video id list: ' + videoIDs);
        console.log('Number of videos:', videoIDs.length);

        for (let i = 0; i < playerAppend && i < videoIDs.length; i++) {
            id = videoIDs[i];
            swiper.appendSlide(`
                    <div class="swiper-slide">
                        <div class="actions">
                            <img id="like-${i}" src="img/like.svg" />
                            <p>${like_count_list[i]}</p>
                            <img id="dislike-${i}" src="img/dislike.svg" />
                            <p>Dislike</p>
                            <img id="comment-${i}" src="img/comment.svg" />
                            <p>${comment_count_list[i]}</p>
                            <img id="share-${i}" src="img/share.svg" />
                            <p>Share</p>
                        </div>
                        <div id="overlay-${i}" class="overlay"></div>
                        <div id="player-${i}"></div>
                    </div>
                `);

            $(`#like-${i}`).click(function () {
                var self = this;
                var fd = new FormData();
                fd.append('uid', test_uid);
                fd.append('vid', videoIDs[i]);
                // fd.append( 'start_time', video_start_time);
                // fd.append( 'end_time', currentDate());
                // fd.append('start_how', gesture);
                // fd.append('end_how', gesture);
                fd.append('liked', $(this).attr('class') === 'active' ? 'false' : 'true');
                fd.append('liked_datetime', currentDate());
                //when clicking "like", unchecking "dislike"
                $(this).attr('class') === 'active' ? 'false' : $(`#dislike-${i}`).removeClass('active');
                $.ajax({
                    url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
                    data: fd,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    success: function (data) {
                        $(self).toggleClass('active');
                    }
                });
            });
            $(`#dislike-${i}`).click(function () {
                var self = this;
                var fd = new FormData();
                fd.append('uid', test_uid);
                fd.append('vid', videoIDs[i]);
                // fd.append( 'start_time', video_start_time);
                // fd.append( 'end_time', currentDate());
                // fd.append('start_how', gesture);
                // fd.append('end_how', gesture);
                fd.append('disliked', $(this).attr('class') === 'active' ? 'false' : 'true');
                fd.append('disliked_datetime', currentDate());
                //when clicking "dislike", unchecking "like"
                $(this).attr('class') === 'active' ? 'false' : $(`#like-${i}`).removeClass('active');

                $.ajax({
                    url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
                    data: fd,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    success: function (data) {
                        $(self).toggleClass('active');
                    }
                });
            });
            $(`#comment-${i}`).click(function () {
                // $(this).toggleClass('active');
                showCommentList(videoIDs[i]);
            });
            $(`#share-${i}`).click(function () {
                var self = this;
                var fd = new FormData();
                fd.append('uid', test_uid);
                fd.append('vid', videoIDs[i]);
                // fd.append( 'start_time', video_start_time);
                // fd.append( 'end_time', currentDate());
                // fd.append('start_how', gesture);
                // fd.append('end_how', gesture);
                fd.append('share', $(this).attr('class') === 'active' ? 'false' : 'true');
                fd.append('share_datetime', currentDate());

                $.ajax({
                    url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
                    data: fd,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    success: function (data) {
                        $(self).toggleClass('active');
                    }
                });
            });
            $(`#overlay-${i}`).click(function () {
                if (youtubePlayers[i].getPlayerState() == YT.PlayerState.PAUSED) {
                    youtubePlayers[i].playVideo();
                    postPauseTime(test_uid, videoIDs[i], 'false', currentDate())
                }
                else {
                    youtubePlayers[i].pauseVideo();
                    postPauseTime(test_uid, videoIDs[i], 'true', currentDate())
                }
            });

        }

        // videoIDs.forEach((id, i) => {
        //     swiper.appendSlide(`
        //     <div class="swiper-slide">
        //         <div class="actions">
        //             <img id="like-${i}" src="img/like.svg" />
        //             <img id="dislike-${i}" src="img/dislike.svg" />
        //             <img id="comment-${i}" src="img/comment.svg" />
        //             <img id="share-${i}" src="img/share.svg" />
        //         </div>
        //         <div id="overlay-${i}" class="overlay"></div>
        //         <div id="player-${i}"></div>
        //     </div>
        // `);
        //     $(`#like-${i}`).click(function () {
        //         var self = this;
        //         var fd = new FormData();
        //         fd.append('uid', test_uid);
        //         fd.append('vid', videoIDs[i]);
        //         // fd.append( 'start_time', video_start_time);
        //         // fd.append( 'end_time', currentDate());
        //         fd.append('start_how', gesture);
        //         fd.append('end_how', gesture);
        //         fd.append('liked', $(this).attr('class') === 'active' ? 'false' : 'true');
        //         fd.append('liked_datetime', currentDate());
        //         //when clicking "like", unchecking "dislike"
        //         $(this).attr('class') === 'active' ? 'false' : $(`#dislike-${i}`).removeClass('active');
        //         $.ajax({
        //             url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
        //             data: fd,
        //             processData: false,
        //             contentType: false,
        //             type: 'POST',
        //             success: function (data) {
        //                 $(self).toggleClass('active');
        //             }
        //         });
        //     });
        //     $(`#dislike-${i}`).click(function () {
        //         var self = this;
        //         var fd = new FormData();
        //         fd.append('uid', test_uid);
        //         fd.append('vid', videoIDs[i]);
        //         // fd.append( 'start_time', video_start_time);
        //         // fd.append( 'end_time', currentDate());
        //         fd.append('start_how', gesture);
        //         fd.append('end_how', gesture);
        //         fd.append('disliked', $(this).attr('class') === 'active' ? 'false' : 'true');
        //         fd.append('disliked_datetime', currentDate());
        //         //when clicking "dislike", unchecking "like"
        //         $(this).attr('class') === 'active' ? 'false' : $(`#like-${i}`).removeClass('active');

        //         $.ajax({
        //             url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
        //             data: fd,
        //             processData: false,
        //             contentType: false,
        //             type: 'POST',
        //             success: function (data) {
        //                 $(self).toggleClass('active');
        //             }
        //         });
        //     });
        //     $(`#comment-${i}`).click(function () {
        //         // $(this).toggleClass('active');
        //         showCommentList(videoIDs[i]);
        //     });
        //     $(`#share-${i}`).click(function () {
        //         var self = this;
        //         var fd = new FormData();
        //         fd.append('uid', test_uid);
        //         fd.append('vid', videoIDs[i]);
        //         // fd.append( 'start_time', video_start_time);
        //         // fd.append( 'end_time', currentDate());
        //         fd.append('start_how', gesture);
        //         fd.append('end_how', gesture);
        //         fd.append('shared', $(this).attr('class') === 'active' ? 'false' : 'true');

        //         $.ajax({
        //             url: 'https://youtok-api.momochi.me/SaveVideoInteraction',
        //             data: fd,
        //             processData: false,
        //             contentType: false,
        //             type: 'POST',
        //             success: function (data) {
        //                 $(self).toggleClass('active');
        //             }
        //         });
        //     });
        //     $(`#overlay-${i}`).click(function () {
        //         if (youtubePlayers[i].getPlayerState() == YT.PlayerState.PAUSED) {
        //             youtubePlayers[i].playVideo();
        //             postPauseTime(test_uid, videoIDs[i], 'false', currentDate())
        //         }
        //         else {
        //             youtubePlayers[i].pauseVideo();
        //             postPauseTime(test_uid, videoIDs[i], 'true', currentDate())
        //         }
        //     });
        // })
        swiper.update();
        
        initial_time = currentDate();
        console.log("&&&&&&&&&&&&&&&&&&initial time%%%%%%%%%%%%%:" + initial_time);
        postWatchTime(videoIDs[0], initial_time, true, true);

        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";

        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);



    },
    error: function (xhr, status, error) {
        console.log('Error:', error);
    }
});

swiper = new Swiper('.swiper-container', {
    direction: "vertical",
    // pagination: {
    //     el: '.swiper-pagination',
    // },
    navigation: {
        // nextEl: '.swiper-button-next',
        // prevEl: '.swiper-button-prev',
    },
});

swiper.on('transitionStart', function () {
    console.log('youtubePlayers.length: ' + youtubePlayers.length)
    for (const yt of youtubePlayers) {
        if (yt && typeof yt.pauseVideo === 'function') {
            yt.pauseVideo();
        } else {
            console.error('yt is not a valid YouTube player.');
        }
    }
});

swiper.on('transitionEnd', function () {
    var index = this.realIndex;
    currentIndex = index;
    console.log('!!index: ' + index);
    var slide = document.getElementsByClassName('swiper-slide')[index];
    var slideVideo = slide.getElementsByTagName('iframe')[0];
    var slideVideoId = slideVideo.getAttribute('id');

    console.log('!!slide: ' + slide);
    console.log('!!slideVideo: ' + slideVideo);
    console.log('!!slideVideoId: ' + slideVideoId);

    if (currentIndex === 5 || currentIndex % 10 === 5) {
        addMoreVideoPlayers();
    }

    if (currentIndex === 25 || currentIndex % 50 === 25) {
        queryMoreVideos();
    }

    if (slideVideo != null || slideVideo != undefined) {
        // youtubePlayers[index].mute();
        youtubePlayers[index].playVideo();
        // store start_time and end_time
        if (!isLoop){
            postWatchTime(videoIDs[index], currentDate(), true, true);
            if (index != 0)
            {
                postWatchTime(videoIDs[index - 1], currentDate(), false, true);
            }
            isLoop = false;
        }
        
            
    }
});