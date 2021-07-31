const nodeMailer = require('../config/nodemailer');

module.exports.newComment = function(comment){
    console.log('Inside newComment mailer', comment);
    let htmlString = nodeMailer.renderTemplate({comment : comment},'/comments/new_comments.ejs');
    nodeMailer.transporter.sendMail({
        from : 'codeial.web@gmail.com',
        to : comment.post.user.email,
        subject : 'New Comment published !',
        html : htmlString
        
    },function(err,info){
        if(err){console.log('Error in sending mail !',err); return;}
        console.log('Message sent', info);
        return;
    })
}