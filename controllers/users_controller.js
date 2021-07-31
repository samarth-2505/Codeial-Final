const User=require('../models/user');
const fs = require('fs');
const path  = require('path');
const Friendship = require('../models/friendship');

// Render the profile
module.exports.profile = async function(req, res){
    let profileUser = await User.findById(req.params.id);

    let friendship;

    // Check if current user and the profile_user are friends or not
    // Find all the friendship of current user
    let existingFriendship = await Friendship.find({_id: {$in: req.user.friendships}});

    // If there exist atleast 1 friendship of current user
    if(existingFriendship){
        for(let i of existingFriendship){
            if((i.from_user == req.user.id && i.to_user == req.params.id)
                || (i.from_user == req.params.id && i.to_user == req.user.id)
            ){
                // They are friends !!
                console.log("They are friends");
                friendship = i;
            }
        }
    }

    return res.render('user_profile', {
        title: 'User Profile',
        profile_user: profileUser,
        friendship: friendship
    });

}

module.exports.update = async function(req,res){
    if(req.user.id == req.params.id) //if the signed in user is same as the requested user profile update then only update
    {
        try{
            let user = await User.findById(req.params.id);
            User.uploadedAvatar(req,res,function(err){
                if(err){console.log('Multer Error !',err); return;}

                user.name = req.body.name;
                user.email = req.body.email;

                if(req.file){
                    if(user.avatar){ //if the user alerady has an avatar value
                        if (fs.existsSync(path.join(__dirname,'..',user.avatar))){ // if the file whose value is stored in avatar field is actually present in the folder
                            fs.unlinkSync(path.join(__dirname,'..',user.avatar)); // delete the file
                        }
                    }
                    //saving the path of the uploaded file in the avatar fieldcof user
                    user.avatar = User.avatarPath + '/' + req.file.filename ; 
                }
                user.save();
                return res.redirect('back');
            })
        }
        catch(err){
            req.flash('error', err);
            return res.redirect('back');
        }
    }
    else{
        req.flash('error','Unauthorized !');
        return res.status(401).send('Unauthorized');
    }
}

// render the sign up page
module.exports.signUp = function(req, res){
    if(req.isAuthenticated())
    {
      return res.redirect('/users/profile');
    }

    return res.render('user_sign_up', {
        title: "Codeial | Sign Up"
    })
};


// render the sign in page
module.exports.signIn = function(req, res){
    if(req.isAuthenticated())
    {
      return res.redirect('/users/profile');
    }

    return res.render('user_sign_in', {
        title: "Codeial | Sign In"
    })
};

//get the sign up data
module.exports.create=function(req,res){
    console.log(req.body);
    if(req.body.password != req.body.confirm_password)
    {
        return res.redirect('back');
    }
    User.findOne({email : req.body.email},function(err,user){
      if(err)
      {
          console.log('Error in finding user in sign up !');
          return;
      }
      if(!user) //user not present
      {
          User.create(req.body,function(err,user){
            if(err)
            {
                console.log('Error in creating user in sign up !');
                return;
            }
            return res.redirect('/users/sign-in');
          });
      }
      else //user already exists
      {
          return res.redirect('back');
      }
    });   
};

//sign in and create a session for the user
module.exports.createSession=function(req,res){
    req.flash('success', 'Logged In Succesfully !');
    return res.redirect('/');
}

module.exports.destroySession=function(req,res){
    req.logout();
    req.flash('success', 'You Have Logged Out !');
    return res.redirect('/');
}