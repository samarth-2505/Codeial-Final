const Post= require('../models/post');
const User= require('../models/user');

module.exports.home = async function(req, res){
    //cookies come with the req 
    console.log(req.cookies);
    //we can change the cookie's key's value like this at the server side
    // res.cookie('user_id',25);
    
    // Post.find({},function(err,posts){
    //     return res.render('home', {
    //         title: "Home Page",
    //         posts : posts            //This way, only the user's id will be accesible in the ejs file
    //     });
    // });
    
    //populate the user of each post and the comments array of each post, also populate the user of each comments array's element
    try{
         // populate the user of each post
         let posts = await Post.find({})
         .sort('-createdAt')   // To show the latest post first
         .populate('user')
         .populate({
             path: 'comments',
             populate: [
                 {
                     path: 'user'
                 },
                 {
                     path: 'likes'
                 }
             ]
                     // Sir coded -->> But Wrong way because populate will be overwritten by the later one
             // populate: {
             //     path: 'user'
             // },
             // populate: {
             //     path: 'likes'
             // }
         }).populate('likes');

        let users = await User.find({});
         
        let loggedInUser;
        if(req.user){   //  Find all the friends of the user if user is logged in
            loggedInUser = await User.findById(req.user._id)
            .populate({
                path: 'friendships',
                populate: [
                    {
                        path: 'from_user'  // ***** TODO: Don't set the password to browser  *****
                    },
                    {
                        path: 'to_user'   // ***** TODO: Don't set the password to browser  *****
                    }
                ]
            });

        }
        return res.render('home', {
            title: "Codeial | Home",
            posts:  posts,
            all_users: users,
            logged_in_user: loggedInUser
        });
    }
    catch(err){
        console.log('Error ! ',err);
        return;
    }
    
};

// module.exports.actionName = function(req, res){}