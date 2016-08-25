$(document).ready(function() {
    var socket = io.connect();
    var loginForm = $(".login-form"),
        loginField = loginForm.find("#login-field"),
        chatForm = $(".chat-form"),
        messageField = chatForm.find("#message-field"),
        messagesList = $(".messages-list"),
        passwordField = loginForm.find("#password-field");

    loginForm.on("submit", function (e) {
        e.preventDefault();
        let userName = loginField.val();
        let password = passwordField.val();
        if (userName !== '' && password !== "") {
            socket.emit("auth", {username: userName, password: password});
            socket.on('authenticated', function () {
                $("#chat-panel").show();
                $(".login-form").hide();
            });
        }
        loginField.val('');
        passwordField.val('');
    });

    chatForm.on("submit", function (e) {
        e.preventDefault();
        var message = messageField.val();
        if (message !== '') {
            socket.emit("message", message);
        }
        messageField.val('');
        return false;
    });

    socket.on("message", function (data) {
        messagesList.append("<li>" + data.created + " " + data.username + ": " + data.message + "</li>");
    });

    socket.on("load messages", function (data) {
        for (var i = 0; i < data.length; i++) {
            messagesList.append("<li>" + data[i].created + " " + data[i].username + ": " + data[i].message + "</li>");
        }
    });

    socket.on("user names", function (data) {
        var userList = $(".user-list");
        userList.empty();
        for (var i = 0; i < data.length; i++) {
            userList.append("<li>" + data[i] + "</li>");
        }
    });

    socket.on("loginError", function () {
        alert("wrong username or password");
    });
});




