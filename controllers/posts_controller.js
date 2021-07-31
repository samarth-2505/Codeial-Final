const Post= require('../models/post');
const Comment = require('../models/comment');
const Like = require('../models/like');

//no need to convert to async await as there's only one level of heirarchy , but still it can be converted (see in the pdf)
module.exports.create= function(req,res){
    Post.create({
        content : req.body.content,
        user : req.user._id
    },async function(err,post){
        if(err){req.flash('error', 'Error in Creating Post !'); return res.redirect('back');}
        if(req.xhr){
          // if we want to populate just the name of the user (we'll not want to send the password in the API), this is how we do it!
          post = await post.populate('user', 'name').execPopulate();
          return res.status(200).json({
            data : {
              post : post
            },
            message : "Post Created !"
          });
        }
        req.flash('success', 'Post Published !');
        return res.redirect('back');
    });
}

module.exports.destroy = async function(req,res){

  try{
    let post = await Post.findById(req.params.id);
    // .id means we are converting the object id stored in ._id to string for comparison
    if(post.user == req.user.id){
      // CHANGE :: delete the associated likes for the post and all its comments' likes too
      await Like.deleteMany({likeable: post, onModel: 'Post'});
      await Like.deleteMany({_id: {$in: post.comments}});
     post.remove();
     await Comment.deleteMany({post : req.params.id /* or post.id */});
     if(req.xhr){
       return res.status(200).json({
        data : {
          post_id : req.params.id
        },
        message : "Post Deleted !"
       });
     }
     req.flash('success', 'Post Deleted !');
     return res.redirect('back');
    }
    else{
      req.flash('error', 'You cannot delete this post !');
      return res.redirect('back');
    } 
  } 
  catch(err){
    req.flash('error', 'Error in Deleting Post !');
    return res.redirect('back');
  }
 
}