const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost:27017/Pintest");

// Define the schema for the user
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post' // Assuming you have a 'Post' model
  }],
  dp: {
    type: String,
    default: 'default.jpg' // Assuming default image filename
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullname: {
    type: String,
    required: true
  },
  profileImage: {
    type: String
  }
});

userSchema.plugin(plm);

// Create the User model based on the schema
module.exports = mongoose.model('User', userSchema);
