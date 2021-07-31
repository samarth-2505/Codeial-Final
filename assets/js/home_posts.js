{
    //method to submit the form data for new post using AJAX
    let createPost = function(){
        let newPostForm = $('#new-post-form');
        newPostForm.submit(function(e){
            e.preventDefault();

            $.ajax({
             url : '/posts/create',
             method : 'post',
             data : newPostForm.serialize(), //sends the post form data in JSON format
             success : function(data){
                 let newPost = newPostDom(data.data.post);
                 $('#posts-list-container>ul').prepend(newPost);
                 deletePostDom($(' .delete-post-btn', newPost));  //attaching the delete method to every delete anchor tag of the newPost created

                 // call the create comment class
                 new PostComments(data.data.post._id);

                 // CHANGE :: enable the functionality of the toggle like button on the new post
                 new ToggleLike($(' .toggle-like-button', newPost));

                 new Noty({
                    theme: 'relax',
                    text: "Post published!",
                    type: 'success',
                    layout: 'topRight',
                    timeout: 1500
                    
                }).show();
             },
             error : function(error){
                 console.log(error.responseText);
             }
            });
        });
    }

  // method to create a post in DOM
  let newPostDom = function(post){
    // CHANGE :: show the count of zero likes on this post
    return $(`<li id="post-${post._id}">
                <p>
                    
                    <small>
                        <a class="delete-post-button"  href="/posts/destroy/${ post._id }">X</a>
                    </small>
                   
                    ${ post.content }
                    <br>
                    <small>
                    ${ post.user.name }
                    </small>
                    <small>
                        
                            <a class="toggle-like-button" data-likes="0" href="/likes/toggle/?id=${post._id}&type=Post">
                                0 Likes
                            </a>
                        
                    </small>

                </p>
                <div class="post-comments">
                    
                        <form id="post-${ post._id }-comments-form" action="/comments/create" method="POST">
                            <input type="text" name="content" placeholder="Type Here to add comment..." required>
                            <input type="hidden" name="post" value="${ post._id }" >
                            <input type="submit" value="Add Comment">
                        </form>
           
            
                    <div class="post-comments-list">
                        <ul id="post-comments-${ post._id }">
                            
                        </ul>
                    </div>
                </div>
                
            </li>`)
}
    
    //method to delete a post from DOM
    let deletePostDom = function(deleteLink){
        $(deleteLink).click(function(e){
            e.preventDefault();
            $.ajax({
             url : $(deleteLink).prop('href'),
             method : 'get',
             success : function(data){
               $(`#post-${data.data.post_id}`).remove();
               new Noty({
                theme: 'relax',
                text: "Post Deleted!",
                type: 'success',
                layout: 'topRight',
                timeout: 1500
                
            }).show();
             },
             error : function(error){
                console.log(error.responseText);
            }
            });
        });
    }

    // loop over all the existing posts on the page (when the window loads for the first time) and call the delete post method on delete link of each, also add AJAX (using the class we've created) to the delete button of each
    let convertPostsToAjax = function(){
        let posts = $('#posts-list-container>ul>li');
        posts.each(function(){
          let self = $(this);
          let deleteButton = $(' .delete-post-btn', self);
          deletePostDom(deleteButton);
        });
    } 
    
    createPost();
    convertPostsToAjax();
}