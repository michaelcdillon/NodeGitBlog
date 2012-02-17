install_production :
    
	rm -rf /var/node-apps/NodeGitBlog
	mkdir -p /var/node-apps/NodeGitBlog
	cp -R ./* /var/node-apps/NodeGitBlog

test :
    
	node run-tests.js

start_app :

	forever start app.js

stop_app :

	- forever stop app.js

restart_production :

	- make stop_app;
	make start_app;

