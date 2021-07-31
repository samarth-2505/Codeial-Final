const Comment = require('../models/comment');
const Post = require('../models/post');
const commentsMailer = require('../mailers/comments_mailer');
const commentEmailWorker = require('../workers/comment_email_worker');
const queue = require('../config/kue');
const Like = require('../models/like');

module.exports.create = async function(req,res){
try{
  let post = await Post.findById(req.body.post);
   if(post){  //if post with the given id exists then create a comment on that post
      let comment = await Comment.create({
           content : req.body.content,
           post : req.body.post,
           user : req.user._id
       });
      post.comments.push(comment); //push the comment id in comment's array of post schema
      post.save(); // save the changes after pushing the comment
      comment = await comment.populate({
        path : 'post',
        populate : {
          path : 'user',
          select : 'name email'
        }
      }).populate({
        path : 'user',
        select : 'name'
      })
      .execPopulate(); //we want to populate user of comment model , 
      // but we are not populating it fully, only the name and email key of user are being populated 
      // commentsMailer.newComment(comment);
      let job = queue.create('emails',comment).save(function(err){
        if(err){
          console.log('Error in sending job to the queue !', err);
          return;
        }
        console.log('Job Enqueued !',job.id);
      });
      if (req.xhr){
        return res.status(200).json({
            data: {
                comment: comment
            },
            message: "Post created!"
        });
    }
      req.flash('success', 'Comment Posted !');
      return res.redirect('/');
   }
}
catch(err){
  req.flash('error', err);
  return res.redirect('/');
}  
};

module.exports.destroy = async function(req,res){
try{
  let comment = await Comment.findById(req.params.id); 
    let postId = comment.post;
    let post = await Post.findById(postId); 
      if(req.user.id == comment.user || req.user.id == post.user){ // if the user logged in is the guy who commented or the guy who posted 
        comment.remove(); // then only he/she can remove the comment
        await Post.findByIdAndUpdate(postId, {$pull : {comments : req.params.id}});
        // CHANGE :: destroy the associated likes for this comment
        await Like.deleteMany({likeable: comment._id, onModel: 'Comment'});

        // send the comment id which was deleted back to the views
        if (req.xhr){
            return res.status(200).json({
                data: {
                    comment_id: req.params.id
                },
                message: "Post deleted"
            });
        }
        req.flash('success', 'Comment Deleted !');
        return res.redirect('back');
      }
      else{
        req.flash('error', 'You cannot Delete this Comment !');
        return res.redirect('back');
      }
} 
catch(err){
  req.flash('error', err);
  return res.redirect('/');
}
};
