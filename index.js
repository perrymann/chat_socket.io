"use strict";

require("dotenv").config();
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT ||3001;
const bcrypt = require("bcrypt-nodejs");
const Message = require("./database/messageProvider");
const User = require("./database/userProvider");
require('./database/database_connection');

if (!module.parent) {
    server.listen(port, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`App is listening on port ${port}`);
        }
    });
}

const userList = [];

app.use(express.static('public'));

io.sockets.on("connection", (socket) => {
    socket.auth = false;
    console.log("user connected: " + socket.id)
    socket.on("auth", function(data) {
        console.log("autentikoidaan");
        authenticate(socket, data, function (err, success) {
            if (!err && success){
                console.log("Authenticated socket ", socket.id);
                socket.auth = true;
                socket.emit("authenticated");

                // userlist update

                socket.username = data.username;
                userList.push(socket.username);
                socket.broadcast.emit("user names", userList);
                socket.emit("user names", userList);
                console.log("userlist: " + userList);

                // retrieving old messages
                Message.find(function (err, messages) {
                    if (err) return console.error(err);
                    //console.log(messages);
                    socket.emit("load messages", messages);
                });

            } else {
                console.log("bad login");
                socket.emit("loginError");
            }
        });
    });
    // disconnect
    socket.on("disconnect", function(){
        if (socket.auth) {
            if (!socket.username) return;
            userList.splice(userList.indexOf(socket.username), 1);
            socket.broadcast.emit("user names", userList);
            socket.emit("user names", userList);
            socket.auth = false;
            console.log("user disconnected: " + socket.id);
            console.log("userlist: " + userList);
        }
    });

    // send a message
    socket.on("message", function(data){
        if (socket.auth) {
            console.log("New message by " + socket.username + ": " + data);
            const newMessage = new Message({username: socket.username, message: data});
            newMessage.save(function (err) {
                if (err) return console.error(err);
            });
            socket.broadcast.emit("message", {created: newMessage.created, message: data, username: socket.username});
            socket.emit("message", {created: newMessage.created, message: data, username: socket.username});
        }
    });

});

function authenticate(socket, data, callback) {
    var username = data.username;
    var password = data.password;

    User.find({username: username}, function(err, users) {
        if (err || !users[0]) {
            return callback(new Error("User not found"), null);
        } else {
            return callback(null, bcrypt.compareSync(password, users[0].toObject().password))
        }
    });
}

module.exports = app;
