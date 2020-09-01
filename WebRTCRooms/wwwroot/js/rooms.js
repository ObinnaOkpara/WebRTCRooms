
var connection = new signalR.HubConnectionBuilder().withUrl("/roomshub").build();

connection.start().then(function () {
    console.log("connected!");

    connection.invoke("getrooms").catch(function (err) {
        return console.error(err.toString());
    });

}).catch(function (err) {
    return console.error(err.toString());
});

connection.on("allrooms", function (rooms) {
    $('#rooms').html("");
    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].count > 0) {
            $('#rooms').append(`<a href="Room?n=${rooms[i].name}" class="btn btn-primary w-100 mt-2 roombtn" 
                                roomname="${rooms[i].name}"> <span class="float-left">${rooms[i].name}
                                </span> <span class="float-right">${rooms[i].count}</span></a>`);
        } else {
            $('#rooms').append(`<div class="w-100"><div class="w-100 mt-2 float-left"><a href="Room?n=${rooms[i].name}" class="btn btn-primary w-75 float-left roombtn" 
                                roomname="${rooms[i].name}"> <span class="float-left">${rooms[i].name}
                                </span> <span class="float-right">${rooms[i].count}</span></a>
                                <button class="btn btn-outline-danger w-25 float-left closebtn" roomid="${rooms[i].name}">close</button>
                                </div></div>`);
        }
    }
});

connection.on("error", function (message) {
    alert(message);
});

connection.on("success", function (message) {
    console.log(message);
});

$('#submitroom').on('click', function () {
    var roomname = $('#roomname').val();
    if (roomname) {
        $('#roomname').val("");

        connection.invoke("addroom", roomname).catch(function (err) {
            return console.error(err.toString());
        });
    }
});

$('#rooms').on('click', '.closebtn', function () {
    var roomname = $(this).attr('roomid');

    connection.invoke("closeroom", roomname).catch(function (err) {
        return console.error(err.toString());
    });
});

$('#refreshBtn').on('click', function () {
    $('#rooms').html('<span class="spinner-border"></span>');

    connection.invoke("getrooms").catch(function (err) {
        return console.error(err.toString());
    });
});