"use strict";

const mongoose = require("./database_connection");

let Schema = mongoose.Schema;

module.exports = mongoose.model("User", new Schema({
    username: String,
    password: String
}));


