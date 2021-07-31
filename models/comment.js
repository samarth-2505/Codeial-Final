const mongoose=require('mongoose');

const commentSchema=mongoose.Schema({
    content : {
        type : String,
        required : true
    },
    // a comment belongs to a user
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    // a comment is done on a post
    post : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Post'
    },
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Like'
        }
    ]
}, {
  timestamps : true
});

const Comment=mongoose.model('Comment',commentSchema);

module.exports = Comment;