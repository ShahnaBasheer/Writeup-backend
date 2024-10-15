const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Article schema
const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 5
    },
    category: {
        type: String,
        required: true,
        minlength: 3
    },
    content: {
        type: String,
        required: true,
        minlength: 100
    },
    image: {
        type: String, // If storing image as a URL or path
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create the Article model from the schema
const Article = mongoose.model('Article', articleSchema)


module.exports = Article;