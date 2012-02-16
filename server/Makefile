install_production :

	sudo mkdir -p /var/node-apps/NodeGitBlog
	sudo cp -R ./* /var/node-apps/NodeGitBlog
    sudo export NODE_ENV=production

start_app :

	sudo forever start app.js

stop_app :

	- sudo forever stop app.js

deploy_production :

	- sudo make stop_app;
	sudo make install_production;
	sudo make start_app;

