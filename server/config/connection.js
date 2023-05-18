const mongoose = require('mongoose');

mongoose.connect(
  process.env.MONGODB_URI ||
    'mongodb+srv://jorgeelectron:c8ytSxVLk6bIoFK3@cluster0.urmn6ua.mongodb.net/'
); //jorge atlas conneciton string

module.exports = mongoose.connection;
