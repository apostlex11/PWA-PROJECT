// connection to Mongo here

const mongoose = require('mongoose');
require('dotenv').config();
console.log(process.env.MONGODB_URI);

// preparing for heroku deployment
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/databasename');

module.exports = mongoose.connection;