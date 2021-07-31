const mongoose=require('mongoose');

const postSchema=mongoose.Schema({
    content : {
        type : String,
        required : true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    // including the array of ids of all comments done on the post in the post schema itself(to make accessing of comments faster)
    comments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Comment'
        }
    ],
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Like'
        }
    ]
}, {
  timestamps : true
});

const Post=mongoose.model('Post',postSchema);

module.exports = Post;