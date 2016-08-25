"use strict";

const mongoose = require("./database_connection");

let Schema = mongoose.Schema;

module.exports = mongoose.model("Message", new Schema({
    username: String,
    message: String,
    created: {type: Date, default: Date.now}
}));




