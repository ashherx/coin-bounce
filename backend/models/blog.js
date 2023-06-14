const moongose = require('mongoose');

const {SCHEMA} = moongose;

const blogSchema = moongose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    photoPath: {type: String, required: true},
    author: {type: moongose.SchemaTypes.ObjectId, ref: 'User'}
},
    {timestamps: true}
)

module.exports = moongose.model('Blog', blogSchema, 'blogs');