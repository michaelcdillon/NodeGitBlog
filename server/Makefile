install_production :
    
	rm -rf /var/node-apps/NodeGitBlog
	mkdir -p /var/node-apps/NodeGitBlog
	cp -R ./* /var/node-apps/NodeGitBlog

test :
    
	node run-tests.js

start_app :

	NODE_ENV=production forever start /var/node-apps/NodeGitBlog/app.js

stop_app :

	- forever stop /var/node-apps/NodeGitBlog/app.js

restart_production :

	- make stop_app;
	make start_app;

