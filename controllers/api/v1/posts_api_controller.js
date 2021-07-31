const Post = require('../../../models/post');
const Comment = require('../../../models/comment');

module.exports.index = async function(req,res){

    let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path : 'comments',
            populate : {
                path : 'user'
            }
        });

    return res.json(200,{
        message : "List of posts",
        posts : posts
    })
}

module.exports.destroy = async function(req,res){

    try{
      let post = await Post.findById(req.params.id);
      // .id means we are converting the object id stored in ._id to string for comparison
      if(post.user == req.user.id){
       post.remove();
       await Comment.deleteMany({post : req.params.id /* or post.id */});
       
       return res.json(200,{
           message : "Post and associated Comments deleted !"
       });
      }
      else{
        return res.json('401',{
            message : "You cannot delete this post !"
        });
      } 
    } 
    catch(err){
      console.log(err);
      return res.json(500,{
          message : "Internal Server Error"
      });
    }
   
  }