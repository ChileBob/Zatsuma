# Installation on Ubuntu Linux (16.04.06)

This guide is for installing all Zatsuma components on a single machine.

This guide has many steps. It *would* be easier if there was an install script but as installation requires root access and involves other peoples money I'm not keen on the idea. 

Each type of component must run using a different user account to create layers between the outside world (webserver), the
shop daemon (shopd) and the node daemons (shopd-zec, shopd-btc, shopd-btcln) which have access to nodes where your coins are stored.

You will need 'root' access to the machine for this installation.

# Requirements :-

	Ubuntu/Debian Linux (64-bit)
	5Gb RAM (minimum), 8Gb (recommended)
	Lots of disk space
	
## Login as your regular username, open a terminal & update your machine :-

	sudo apt-get update
	sudo apt-get upgrade

## Create a new user account for zatsuma :-

	sudo adduser zatsuma

## Install zcash :-

	The official documentation for zcash is at https://zcash.readthedocs.io 

	Its an excellent guide, the relevant installation instructions are in the 'Debian Binary Packages Setup' section.

	If you run into problems visit the Zcash Community Forum https://forum.zcashcommunity.com

	Remember that zcashd has to download the its blockchain (approx 25Gb), this takes a long time as its a lot of data
	and every block has to be verified.

	The install commands are :-
	
	sudo apt-get install apt-transport-https wget gnupg2
	wget -qO - https://apt.z.cash/zcash.asc | sudo apt-key add -
	echo "deb [arch=amd64] https://apt.z.cash/ jessie main" | sudo tee /etc/apt/sources.list.d/zcash.list
	sudo apt-get update && sudo apt-get install zcash
	zcash-fetch-params

## Configure zcash :-

	You must now create a configuration file :-
	
	mkdir -p ~/.zcash
	vi ~/.zcash/zcash.conf

	The configuration needs to look like this :-

	rpcuser=replace_with_a_username
	rpcpassword=replace_with_a_long_random_string
	rpcport=8232
	mainnet=1
	addnode=mainnet.z.cash
	walletnotify=/home/yourusername/zatsuma/shopd-zec -notify %s

	(IMPORTANT: Make sure the 'rpcuser', 'rpcpassword', and 'rpcport' are specified)

## Start the zcashd daemon :-

	zcashd --daemon

## Install all the required packages :-

	sudo apt-get install build-essential
	sudo apt-get install git -y
	sudo apt-get install mysql-server		(note down your mysql 'root' password)
	sudo mysql_secure_installation			
	sudo apt-get install libmysqlclient-dev
	sudo apt-get install apache2
	sudo apt-get install perl
	sudo apt-get install libdbi-perl
	sudo apt-get install libdbd-mysql-perl

## Upgrade cpan :-

	sudo cpan
	install CPAN
	reload cpan
	exit

## Install the following perl modules :-

	sudo cpan install CGI
	sudo cpan install CGI::Cookie
	sudo cpan install IO::Socket::INET
	sudo cpan install JSON
	sudo cpan install JSON::RPC::Client
	sudo cpan install Encode
	sudo cpan install DBI
	sudo cpan install DBD::mysql
	sudo cpan install LWP::UserAgent
	sudo cpan install HTTP::Request
	sudo cpan install String::HexConvert
	sudo cpan install HTML::Restrict
	sudo cpan install HTML::Entities
	sudo cpan install Data::Dumper

## Download and extract zatsuma :-

	If you have zatsuma as a tarball, do this :-

	tar xvf zatsuma-0.0.6-rc2.tar.gz
	cp zatsuma-0.0.6-rc2/shopd/* .

## Create your mysql database :-

	Login to mysql as the root user :-

	mysql -u root -p 					(enter your mysql root password when prompted)
	create database zatsuma;
	GRANT ALL PRIVILEGES ON zatsuma.* TO 'zatsuma'@'localhost' IDENTIFIED BY 'your zatsuma database password';
	exit

	Create database tables :-

	mysql zatsuma -u zatsuma -p < zatsuma/zatsuma.sql 	(enter your zatsuma database password when prompted)

## Open a new terminal window and change to the 'zatsuma' user account :-

	sudo su - zatsuma

	Now open the 'shopd.conf' configuration file with a text editor. I use 'vi' because yes, I'm really that old :-

	vi shopd.conf

	You will see various fields with a 'REPLACE ME' tag, these need to be changed to match your setup :=

	shopname = "Choose a short name for your shop"

## Create a CoinLib account :-

	Visit https://coinlib.io and create an account, this is where shopd gets coin price data from.

	When you have an account, click on your username and select 'Profile' to see your 'API key'.

	Edit the 'shopd.conf' configuration so it shows :-

	coinlib_api = "yourAPIkeyGOEShere"

## Create a DuckDNS account :-

	Visit https://duckdns.org and create an account, this provides the dynamic DNS service that shopd 
	uses to connect your website name to your IP address.

	You have to sign in using one of your Persona, Twitter, GitHub, Reddit or Google accounts.

	Register your domain and edit the 'shopd.conf' configuration file so it shows :-

	duckdns_domain = "yourDOMAINname"
	duckdns_token = "yourDUCKDNStoken"

## Now run 'shopd' for the first time to create an 'admin' user account :-

	./shopd

	IMPORTANT: Make a node of the admin username & password, its encrypted and cannot be retreived later.

	If everything has worked you will see the following message :-

	DEBUG: Listening on 127.0.0.1, port 8998, 50 sockets available

	Now make shopd run automatically when your machine starts :-

	crontab -l >mycrontab
	echo "@reboot /home/zatsuma/shopd >/dev/null 2>&1" >>mycrontab
	crontab mycrontab
	rm crontab

## Now confirm dynamic dns is working :-

	./shopd -duckdns
	host yourdomainname.duckdns.org			(This should show your public IP address)

	Now confirm coinlib is working :-

	./shopd -coinlib
	mysql zatsuma -u zatsuma -p			(enter your zatsuma mysql password when prompted)
	select * from exchange;				(This should give you the current ZEC & BTC prices)
	exit

## Assuming everything is working, make shopd run at regular intervals to refresh this data :-

	crontab -l >mycrontab
	echo "* * * * * /home/zatsuma/shopd -coinlib >/dev/null 2>&1" >>mycrontab
	echo "*/3 * * * * /home/zatsuma/shopd -duckdns >/dev/null 2>&1" >>mycrontab
	crontab mycrontab
	rm mycrontab

	Congratulations! You have now installed shopd :-)

## Now install shopd-zec, to do that open a terminal as your regular username :-

	mkdir zatsuma
	cd zatsuma

## Now copy the zatsuma node daemon for zcash and its configuration file :-

	sudo cp /home/zatsuma/zatsuma/shopd-zec/* .
	sudo chown yourusername.yourusername shopd-zec*

	There is very little to configure here, but its worth checking the config anyway :-

	vi shopd-zec.conf

	If you want zatsuma to use an existing 'transparent' or 'shielded' address for its general purpose wallet, enter them 
	as shown. You can just ignore this, shopd-zec will create new addresses from your node if required.

## Now run shopd-zec to make sure its working :-

	./shopd-zec

## If your zcashd node is not running or has not yet syncronised you will see the following message :-
	
	DEBUG: WARNING! zcashd IS NOT RUNNING! Retrying in 60 seconds...

## To make the zatsuma daemon for zcash run automatically when your computer starts :-

	crontab -l >mycrontab
	echo "@reboot /home/yourusername/zatsuma/shopd-zec >/dev/null 2>&1" >>mycrontab
	crontab mycrontab
	rm mycrontab

## If you want zatsuma to accept bitcoin on-chain or bitcoin-lightning transactions, install the node daemons :-

	sudo cp /home/zatsuma/zatsuma/shopd-btc/* .
	sudo cp /home/zatsuma/zatsuma/shopd-btcln/* .
	sudo chown yourusername.yourusername shopd-btc*

	The shopd-btc.conf file does not need to be changed, unless you want to specify the shop general purpose address.

	The shopd-btcln.conf file DOES need to be edited :-

	vi shopd-btcln-conf

	Change the last line of shopd-btcln.conf where it says 'REPLACE THIS' with the full path to the lncli client, for example :-

	client = "/home/yourusername/gocode/bin/lncli"


## You can now start the zatsuma node daemons, run each of these in a seperate terminal window for now :-

	./shopd-btc
	./shopd-btcln

	Until the Bitcoin/Lightning nodes are installed, running and synchronised you will get the following warnings :-

	DEBUG: WARNING! bitcoind IS NOT RUNNING! Retrying in 60 seconds...
	DEBUG: WARNING! lnd IS NOT RUNNING! Retrying in 60 seconds...

## To make the zatsuma daemons for bitcoin & lightning run automatically when your computer starts :-

	crontab -l >mycrontab
	echo "@reboot /home/yourusername/zatsuma/shopd-btc >/dev/null 2>&1" >>mycrontab
	echo "@reboot /home/yourusername/zatsuma/shopd-btcln >/dev/null 2>&1" >>mycrontab
	crontab mycrontab
	rm mycrontab

## Now install the Bitcoin node :-

	The official download site is https://bitcoin.org, complete with excellent instructions.

	Edit the configuration file :-

	vi /home/yourusername/.bitcoin/bitcoin.conf

	Add or change the following lines, make sure you use something unique/random for rpcuser & rpcpassword :-

	server=1
	listen=1
	daemon=1
	txindex=1
	walletnotify=/home/yourusername/zatsuma/shopd-btc -notify %s
	rpcuser=YOURrpcUSERNAMEgoesHERE
	rpcpassword=AreasonablyLONGstringGOEShere
	zmqpubrawblock=tcp://127.0.0.1:18501
	zmqpubrawtx=tcp://127.0.0.1:18502

	Now start the bitcoin daemon, its going to take a *very long time* ! The bitcoin blockchain is approx 262 Gb so 
	depending on your internet connection and CPU speed it could take several days.

	You'll want bitcoin to run as a daemon when you start your computer, that way it will stay synchronised and take
	less time to update when you need it. 

	Confirm where it has been installed :-

	which bitcoind					(probably /usr/local/bin/bitcoind)

	Now do the following :-
	
	crontab -l >mycrontab
	echo "@reboot /full/path/to/bitcoind -daemon" >>mycrontab
	crontab mycrontab
	rm mycrontab


## When the Bitcoin node has fully synchronised you can install Lightning, so come back to this section later.

	Zatsuma uses 'lnd version 0.5.1-beta', things have changed since so beware.

	To download and install lnd-0.5.1-beta follow this guide :-

	https://github.com/lightningnetwork/lnd/releases/tag/v0.5.1-beta

	You need to do the follow before your lnd node can accept payments :-

	- build and install lnd
	- start the daemon
	- wait for it to synchronise with your Bitcoin node (takes a while!)
	- create a wallet
	- fund the wallet (send some Bitcoin to it)
	- open and fund a channel, or even better open two
	- get incoming channel capacity for receiving funds (Tip: Leave it running for several days, channels connect to you)

	
## You now have to configure your apache2 webserver, this assumes you do not have any websites installed on your machine.

	Confirm your webserver is running by visiting http://127.0.0.1 (you should see a 'Default Page')

	Now do the following :-

	cd /var/www
	sudo cp -r /home/zatsuma/zatsuma/webserver/html html
	sudo cp -r /home/zatsuma/zatsuma/webserver/cgi-bin .

	Now you have to edit the webserver configuration :-

	cd /etc/apache2/sites-enabled
		
	Find the following line :-

	DocumentRoot /var/www/html

	Immediatly after that line, add the following :-

	<Directory /var/www/cgi-bin/>
		AllowOverride ALL
		Options +ExecCGI
		AddHandler cgi-script .cgi
	</Directory>

	ScriptAlias /cgi-bin/ "/var/www/cgi-bin/"

	Now enable the apache2 module for cgi-scripts and restart the server :-

	sudo a2enmod cgi
	sudo service apache2 restart


## Congratulations! You have just installed zatsuma on your computer :-)

	To confirm everything is working, visit http://127.0.0.1 and login with your 'admin' account


## Now its time to go public, allowing access your zatsuma shop from anywhere on the net :-

	First, enable 'port forwarding' on the router providing your internet connection.
	
	Every router does this slightly differently but similar steps are needed, on your machine do this :-

	netstat -rn		(look for the IP address of your 'gateway', this is your routers IP address)

	ip a			(look for the MAC address of your computer, it will look like '23:45:54:a1:b5:9f')
				(look for your LAN IP address, it will be something like 'inet 192.168.0.38')
	
	Connect to your router via its admin page by visiting http://your-router-IP address/

	Login, the username/password for your router is probably written on the bottom :-)

	Configure the DHCP server so it reserves an IP address for your machine :-

	- this will need the MAC address and LAN IP addresses that you collected earlier

	Configure port forwarding :-

	- forward port 80 to your reserved LAN IP address
	- forward port 443 to your reserved LAN IP address

	Every router is different so for detailed instructions you should visit the manufacturers website.

	For a general guide to port forwarding, visit https://bitcoin.org/ and navigate to :-

	- Participate
	  - Running a full node
	    - Network Configuration
	      - Port Forwarding

	
	IMPORTANT !!!!!

	The users of your shop are going to expect PRIVACY so you MUST encrypt your webserver traffic.

	Its very easy to get SSL certificates installed on your computer :-
	
	- visit https://certbot.eff.org :-
	- select the Software as 'Apache'
	- select the System as 'Whatever your machine is using'

	Now follow the instructions, which in this case were :-

	sudo apt-get update
	sudo apt-get install software-properties-common
	sudo add-apt-repository universe
	sudo add-apt-repository ppa:certbot/certbot
	sudo apt-get update
	sudo apt-get install certbot python-certbot-apache 
	
	Now get your certificate, install it and update your webserver with the following :-

	sudo certbot --apache

	Now edit your webserver configuration to use your full duckdns domain :-

	sudo vi /etc/apache2/sites-enabled/000-default-le-ssl.conf
	
	Find the line that starts with 'Servername' and change it to  :-

	ServerName yourdomain.duckdns.org

	Now edit the zatsuma javascript to use a secure connection :-

	sudo vi /var/www/html/js/zatsuma.js

	Find the line that says :-

	var shopAPI = 'http://127.0.0.1/cgi-bin/zatsuma.cgi';

	Change it to say :-

	var shopAPI = 'https://yourdomain.duckdns.org/cgi-bin/zatsuma.cgi';

	Now restart your webserver :-

	sudo service apache2 restart


## One last thing, and its EXTREMELY IMPORTANT !!!

	Login to your router and DELETE the rule that forwards port 80 to your machine !


That's it, you should now have Zatsuma running on your computer and accessible to anyone with an internet connection.
