
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
        $('#rooms').append(`<a href="Room?n=${rooms[i].name}" class="btn btn-primary w-100 mt-2 roombtn" 
                                roomname="${rooms[i].name}"> <span class="float-left">${rooms[i].name}
                                </span> <span class="float-right">${rooms[i].count}</span></a`);
    }
});

connection.on("error", function (message) {
    console.log(message);
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