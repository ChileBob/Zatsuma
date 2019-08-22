# Zatsuma User Guide

## Installation

The official download site for Zatsuma is github, the repository is https://github.com/ChileBob/Zatsuma

There's a manual installation guide (INSTALL.md) or you can use the install script (setup).

Zatsuma is designed for Ubuntu Linux.


## Admin User

The admin user has no special privileges, its the default user created when zatsuma is installed.

As with all user accounts the password is randomly generated for several reasons. Humans are really bad at choosing good passwords and Zatsuma uses Mysql which has password policy that must be followed. 

The default policy requires passwords to have a minimum length, contain regular characters, capitals and some special characters.

The admin user password is shown at the end of the install process.


## Adding Users

You can create as many additional users as you want, either on the machine running Zatsuma or by allowing them to create their own accounts. 

To create an account, open a terminal window on the machine running the 'shopd' daemon and type :-

/usr/local/zatsuma/shopd --adduser <username>

Passwords are automatically generated, they're random as humans are really bad at choosing good passwords and must conform to the MySql password policy.


You can also allow users to create their own accounts, open a terminal window and edit the file '~/.zatsuma/shopd.conf', set the following :-

allow_guest = "1"

This will cause Zatsuma to show an extra button on the login page which generates a random username & password. The password is hidden so click on the 'eye' to reveal it.

Allowing guest accounts is disabled by default. Its only useful for demo/testing purposes, or possibly for a crowdfunding event where you don't care who is collect funds.

Usernames are created by choosing a random adjective & animal name from the following files :-

~/.zatsuma/Adjectives.txt
~/.zatsuma/Animals.txt
 

## The Checkout

The Zatsuma checkout is a basic calculator and operates with FIAT amounts, so you can use that however you like to calculate the customers bill.

![alt text](https://github.com/ChileBob/Zatsuma/blob/master/screenshots/checkout.png "Zatsuma Checkout")

As you enter numbers the BTC & ZEC values on the main display will change.

If you are in the middle of a calculation a '+', '-', '/', or 'x' symbol is displayed, pressing the '=' key gives you the amount and crypto equivalent amounts will update.

The crypto prices are also updated once a minute to reflect changes in exchange rates, this happens automatically until an order is placed.

To place an order, click the appropriate payment coin.


## Prices & Exchange Rates

Exchange rates are updated once a minute from CoinLib, given the nature of crypto these prices are unlikely to match those of other exchanges or apps. 

CoinLibs prices are an average of prices from many exchanges, you can also monitor prices at https://coinlib.io or by using their app.


## Accepting Payments

When you click a payment coin the details and a QR code are displayed, the customer scans the QR code with their wallet to pay.

Every 15 seconds the Zatsuma client checks the payment status, this will move through several stages :-

### Waiting For Payment

Notification is the first stage of making a payment, it means the client wallet has sent their transaction to the coin network to be processed. It DOES NOT mean that you have received funds, only that the process has been started.

Until this happens Zatsuma will continue to show the payment details and the QR code.

Additionally, the exchange rate used for an active order will NO LONGER update. This is important as the customer accepted the rate when they placed their order.

Orders can be cancelled at any time until a notification has been received.


### Waiting For Confirmation

When a payment notification has been received Zatsuma updates the order to the next stage.

Notification means the payment process has begun, confirmation means the payment has been mined and cannot be reveresed.

Different coins take a different time to confirm payments, Zcash is approx 150 seconds, Bitcoin on-chain can be 10 minutes, Bitcoin over the Lightning Network confirms immediatly.

The number of confirmations required for an order is defined in 'shopd.conf' and depends on the FIAT amount. The shop owner may choose to accept 0-Conf payments for small amounts, or require several confirmations.

Zatsuma will check every 15 seconds and update the order status.

### Payment Received

This shows the payment has completed, funds have arrived in the shop wallet and have the required number of confirmations.


## Checking Order Status

Zatsuma can process many orders at the same time but can only display one at a time.

A user can click 'My Orders' to get a list of everything they have done, the list is colour coded to show status and selecting one will move it to the order processing screen.


## Setting Confirmations & Limits

The shop owner can set the number of confirmations required for orders based on their FIAT value.

Edit the 'shopd.conf' file and change the following lines as appropriate :-

zec_minconf  = "1"		Minimum number of confirmations
zec_minvalue = "0.5"		Minimum order value, orders less than this FIAT amount are not allowed
zec_expiry   = "3600"		Seconds until an order is considered to have expired

These settings exist for each supported coin as they have differing properties and features, for example :-

Bitcoin On-Chain transactions can be altered using RBF (Replace-By-Fee) until they have been confirmed. This presents a risk the vendor may not be paid, however confirmations can take a very long time which is inconvenient to all.

Zcash does not have RBF, however it has 'transaction expiry' where payments are eventually cancelled by the network.

Bitcoin Lightning transactions confirm instantly.


## Messages

Zatsuma allows users to send each other short text messages, either between two users or as a broadcast to all.

Some shops might find that useful, perhaps to send details about an order (three beers, burgers & fries for table 7), or so users can chat between themselves but within the system.

The zatsuma client checks for new messages every minute, makes a noise when new messages arrive and shows an inbox.

To send a message, select a username (or everyone), type the message & click send. Its all rather basic.


### Zcash Memos

Zcash allows 'encrypted memos', which can be up to 512 characters long and are supported by most modern wallets.

The 'View Orders' page also shows a QR Code which is connected to the shop wallet. Customers can scan this, enter a ZEC amount and a message.

This could be used in all sorts of ways, as a guestbook, somewhere customers can leave feedback, or even for customers to send tips.

Zcash Memos are delivered to all zatsuma users but cannot be replied to.


## Why Zcash ?

Zcash is a private payment method, all transaction details are available on a public blockchain but are encrypted so that only those involved in a transaction can see them. This gives it the same properties as cash.

Transactions happen on-chain which means it takes time for them to confirm, however the time between blocks is only 150 seconds so not too bad - this is also planned to speed up to 75 seconds in the near future.


## Why Bitcoin ?

Bitcoin (on-chain) is the standard crypto, anyone who has crypto has heard of it and probably has some. Its available on every crypto exchange and can be bought through ATMs.

In reality, the long time between blocks (10 minutes) means when the network is busy (full blocks) it can take a very long time for transactions to confirm. This makes it difficult to use on-chain transactions in a retail environment.

Bitcoin can also be sent via the Lightning Network, these transactions confirm instantly and costs are negligable.

To accept payments over the Lightning Network the shop must also have a Bitcoin node, this makes it possible to accept on-chain payments so why not both.


## Transferring Funds

Although Zatsuma can only receive funds these are stored in a node wallet, which should be considered a 'hot wallet' and treated as if it was a cash register in a shop. 

Its important that funds are not just allowed to accumulate and are sent to safe storage, perhaps a paper or hardware wallet. You may also wish to transfer them to an exchange where they can be sold for FIAT.

Zatsuma can only use commands that are 'whitelisted' and this excludes all commands that can send funds, however those commands are available through the RPC or gRPC clients provided with the node software. You can also use graphical wallets such as ZECwallet & bitcoin-qt.


## How To Get Help

Zatsuma was created for Zcash, funded by the Zcash Foundation (ZFgrants) platform and evolves on the Zcash Community Forum.

Feel free to join the forum & post questions. There's no official support but you can ask for ChileBob :-)

