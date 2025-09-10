const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// Apply the plugin to the schema, not the model
userSchema.plugin(passportLocalMongoose);

// Now, define and export the model
module.exports = mongoose.model('User', userSchema);