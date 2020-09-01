var peers = {};
var signaled = {};

var myuserid = "";
var lastuserid = "";



navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
);

if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
    navigator.getUserMedia({
        video: true,
        audio: true
    }, streamHandler, errorHandler);
} else {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(streamHandler).catch(errorHandler);
}


function streamHandler(stream) {

    const videoGrid = document.getElementById('video-grid');
    const mVideo = document.createElement('video');

    addVideoStream(mVideo, stream);

    var connection = new signalR.HubConnectionBuilder().withUrl("/chathub").build();

    connection.start().then(function () {
        console.log("connected!");

        connection.invoke("joinroom", ROOMNAME).catch(function (err) {
            return console.error(err.toString());
        });

    }).catch(function (err) {
        return console.error(err.toString());
    });

    connection.on("error", function (message) {
        alert(message);
    });

    connection.on("firstperson", function (userid) {
        console.log("I am first person " + userid);
        myuserid = userid;
        mVideo.id = userid;
    });

    connection.on("notfirstperson", function (userid, alluserids) {

        console.log("Not first person " + userid);
        myuserid = userid;
        mVideo.id = userid;

        alluserids.forEach(function (curId, i) {
            if (curId != userid) {

                console.log('Connecting to user --- ' + curId);

                peers[curId] = new SimplePeer({
                    initiator: true,
                    trickle: false,
                    stream: stream
                });

                peers[curId].on('signal', function (data) {
                    if (signaled[curId]) {
                        return;
                    }

                    console.log("Gotten signal --- Calling " + curId);

                    connection.invoke("startcall", curId, JSON.stringify(data)).catch(function (err) {
                        return console.error(err.toString());
                    });
                    signaled[curId] = true;
                });

                peers[curId].on('error', err => console.log('error', err + "\n UserId = " + curId));

                //peer.on('data', function (data) {
                //    document.getElementById('messages').textContent += data + '\n';
                //});

                peers[curId].on('stream', function (stream) {
                    var video = document.createElement('video');
                    video.id = curId;
                    console.log("Gotten stream --- Caller");

                    addVideoStream(video, stream);
                });

            }

        });
    });

    connection.on("answercall", function (userid, conndata) {

        var otherPeerId = JSON.parse(conndata);

        var peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        peer.on('signal', function (data) {
            console.log("Signal gotten --- Answering caller");

            connection.invoke("answeringcall", userid, JSON.stringify(data)).catch(function (err) {
                return console.error(err.toString());
            });

        });

        peer.on('data', function (data) {
            document.getElementById('messages').textContent += data + '\n';
        });

        peer.on('stream', function (stream) {

            console.log("Gotten stream -- Callee");

            var video = document.createElement('video');
            video.id = userid;

            addVideoStream(video, stream);
        });

        peer.on('error', err => console.log('error', err + "\n UserId = " + userid));

        peer.signal(otherPeerId);

        peers[userid] = peer;
    });

    connection.on("receivecall", function (userid, conndata) {
        console.log("Recieved call from " + userid);
        var otherid = JSON.parse(conndata);

        peers[userid].signal(otherid);
    });

    connection.on("userdisconnected", function (userid) {
        console.log("user disconnected : " + userid);

        peers[userid].destroy();
        delete peers[userid];
        delete signaled[userid];

        $('#' + userid).remove();
    });

    var count = 0;

    function addVideoStream(video, stream, originator = false) {
        count++;
        console.log("displaying video stream " + count);

        videoGrid.append(video);

        if (originator) {
            video.muted = true;
            video.controls = false;
        } else {
            video.muted = false;
            video.controls = true;
        }

        if ('srcObject' in video) {
            video.srcObject = stream
        } else {
            video.src = window.URL.createObjectURL(stream) // for older browsers
        }

        video.play();

        console.log("displayed video stream " + count);
    }

}

function errorHandler (err) {
    console.error(err);
}