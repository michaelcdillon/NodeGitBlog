NodeGitBlog
----

Simple blogging software that uses a github repo to maintain the
articles, posts, and or content.

----
Instructions
----
In the NodeGitBlog/server directory:

    sudo npm install -d

Make sure you add a post-recieve hook to your github repo repository.


----
Configuration
----
Edit default.yaml in the config directory to point the application to your
mongodb instance. Also make sure the github repository information points
to the repository that will be holding your blog content posts.

----
Posts
----
The only requirement for the post format is that the first line of the file
contain valid json of an array that contains a title element.

    {"title" : "This is a sample title"}