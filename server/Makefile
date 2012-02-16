install_production :

	sudo mkdir -p /var/node-apps/NodeGitBlog
	sudo cp -R ./* /var/node-apps/NodeGitBlog
    export NODE_ENV=production

start_app :

	sudo forever start app.js

stop_app :

	- sudo forever stop app.js

deploy_production :

	make stop_app;
	make install_production;
	make start_app;

