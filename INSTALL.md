# Installation for Ubuntu Linux (18.04)

# Requirements :-

	Ubuntu/Debian Linux (64-bit)
	5Gb RAM (minimum), 8Gb (recommended)
	Lots of disk space (Zcash 30Gb, Bitcoin 250Gb)
	
## If you want your Zatsuma to be publicly accessible, do this first :-

	Enable 'port forwarding' on the router providing your internet connection.
	
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


## Download & Install Zatsuma

	sudo apt-get update					(updates your machine)
	sudo apt-get upgrade					(upgrades installed packages)
	sudo apt-get install git				(installs git, which is needed to download Zatsuma)
	git clone https://github.com/ChileBob/Zatsuma.git	(downloads latest Zatsuma from Github)

	cd Zatsuma				
	chmod +x setup
	sudo ./setup						(runs installation script)

	You'll be prompted for all the things needed to install Zatsuma and and full-nodes it may require.


## Start Zatsuma

	To start Zatsuma and ALL coin nodes :-

		systemctl start zatsuma

	To start Zatsuma and each node individually:-

		systemctl start zatsuma-zec
		systemctl start zatsuma-yec
		systemctl start zatsuma-btc
		systemctl start zatsuma-btcln

	To stop a specific coin :-

		systemctl stop zatsuma-btc

	To stop Zatsuma and ALL coin nodes:-

		systemctl stop zatsuma

	To start Zatsuma automatically when your machine is started:-

		systemctl enable zatsuma

	To stop Zatsuma from starting automatically :-

		systemctl disable zatsuma



