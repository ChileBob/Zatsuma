# Zatsuma User Guide

## Installation

Download Zatsuma from the [main GitHub repo](https://github.com/ChileBob/Zatsuma).

There's a [manual installation guide](https://github.com/ChileBob/Zatsuma/blob/master/INSTALL.md), or you can [use the install script](https://github.com/ChileBob/Zatsuma/blob/master/INSTALL.md#the-easy-way---use-the-install-script).

Zatsuma is designed for Ubuntu Linux.

## Admin User

The admin user has no special privileges. It is the default user created when Zatsuma is installed.

As with all user accounts, the password is randomly generated for a couple of reason: 1) Humans are bad at choosing good passwords, and 2) Zatsuma uses MySQL which has a password policy. The default policy requires passwords to have a minimum length, contain regular characters, capitals, and some special characters.

The admin user password is shown at the end of the install process. **It is only shown once, so make sure to save it securely.**

## Adding Users

You can create as many additional users as you want, either on the machine running Zatsuma or by allowing them to create their own accounts. 

To create an account, open a terminal window on the machine running the 'shopd' daemon and type :-

/usr/local/zatsuma/shopd --adduser <username>

You can also allow users to create their own accounts, open a terminal window and edit the file '~/.zatsuma/shopd.conf', set the following :-

allow_guest = "1"

This will cause Zatsuma to show an extra button on the login page which generates a random username & password. The password is hidden so click on the 'eye' to reveal it.

Allowing guest accounts is disabled by default. Its only useful for demo/testing purposes, or possibly for a crowdfunding event where you don't care who is collecting funds.

Usernames are created by choosing a random adjective & animal name from the following files :-

~/.zatsuma/Adjectives.txt
~/.zatsuma/Animals.txt
 

## The Checkout

The Zatsuma checkout is a basic calculator and operates with FIAT amounts, you can use that however you like to calculate the customers bill.

![alt text](https://github.com/ChileBob/Zatsuma/blob/master/screenshots/checkout.png "Zatsuma Checkout")

As you enter numbers the BTC & ZEC values on the main display will change.

You will also notice a 'rabbit', 'turtle' or 'snail' appear on each payment coin, this is to give an indication of how long each payment method will take. The time varies based on the fiat value and number of confirmations specified in the 'shopd.conf' file.

If you are in the middle of a calculation a '+', '-', '/', or 'x' symbol is displayed and the crypto amounts will not update until you complete it by pressing the '=' key.

Crypto prices are updated once a minute to track the current exchange rate, this happens automatically until an order is placed.

To place an order, click the appropriate payment coin.


## Prices & Exchange Rates

Exchange rates are from CoinLib, given the nature of crypto these prices are unlikely to match those on other exchanges or apps. 

CoinLibs prices are an average from many exchanges, you can also monitor their prices at https://coinlib.io or by using their app (see Google Play).


## Accepting Payments

When you click a payment coin the order details and a QR code are displayed which the customer scans with their wallet. The details include an order number which the customer may want to know.

Every 15 seconds the Zatsuma client checks the payment status, which moves through several stages :-

### Waiting For Payment

Notification is the first stage of receiving a payment, it means the client wallet has sent their transaction to the network to be processed. It DOES NOT mean you have received funds, only that the process has begun.

Zatsuma will continue to show the payment details and the QR code until a notification has been received or the order is cancelled.

Additionally, the exchange rate used for the sale will NO LONGER update while waiting for notification or confirmation. This is important as the customer accepted the rate when they placed their order.

Orders cannot be cancelled after a payment notification has been received.


### Waiting For Confirmation

When a payment notification has been received Zatsuma updates the order.

Notification means the payment process has begun, confirmation means the payment has been mined and cannot be reversed.

Different coins take a different times to confirm transactions. Zcash is approx 150 seconds, Bitcoin On-Chain can be 10 minutes, Bitcoin via Lightning Network confirms immediatly.

The number of confirmations required for an order is defined in 'shopd.conf' and depends on the FIAT amount. The shop owner may choose to accept 0-Conf payments for small amounts or require several confirmations for larger sums.

Zatsuma checks the order status every 15 seconds automatically until it has been fully confirmed.

### Payment Received

This shows the payment has completed, funds have arrived in the shop wallet and the required number of confirmations have been received.


## Checking Order Status

Zatsuma can process many orders at once but can only display one at a time.

A user can click 'My Orders' to get a list of all orders they have taken. The list is colour-coded to show status and selecting one will move it to the order processing screen to show its detail.


## Setting Confirmations & Limits

The shop owner can set the number of confirmations required for orders based on their FIAT value.

Edit the 'shopd.conf' file and change the following lines as appropriate :-

zec_minconf  = "1"		Minimum number of confirmations
zec_minvalue = "0.5"		Minimum order value, orders less than this FIAT amount are not allowed
zec_expiry   = "3600"		Seconds until an order is considered to have expired

These settings exist for each supported coin as they have differing properties and features, for example :-

Bitcoin On-Chain transactions can be altered using RBF (Replace-By-Fee) until they have been confirmed. This presents a risk the vendor may not be paid, however confirmations can take a very long time which is inconvenient to all.

Zcash has 'transaction expiry' where payments are eventually cancelled by the network.

Bitcoin Lightning transactions confirm instantly.


## Messages

Zatsuma allows users to send short text messages, either to individual users or as a broadcast to all.

Some shops may find that useful, perhaps to send details about an order (three beers, burgers & fries for table 7) or so users can chat within the system and away from snoopy apps.

The zatsuma client checks for new messages every minute, makes a noise when they arrive and shows an inbox.

To send a message, select a username (or everyone), type the message & click send. Its all rather basic.


## Zcash Memos

Zatsuma can also receive Zcash 'encrypted memos', which can be up to 512 characters long and are supported by most modern wallets.

The 'View Orders' page shows a QR Code which is connected to the shop wallet. Customers can scan this code, enter a ZEC amount and a message. These messages are broadcast to all Zatsuma users but cannot be replied to.

This can be used in all sorts of ways, as a guestbook, customers feedback, or maybe for customers to send tips.


## Why Zcash ?

Zcash is a private payment method, all transaction details are available on a public blockchain but encrypted so that only those involved in a transaction can see its detail. This gives it the same properties as cash.

Transactions happen on-chain so it takes time for them to confirm, however the time between blocks is only 150 seconds so not too bad - this is also planned to speed up to 75 seconds in the near future.


## Why Bitcoin ?

Bitcoin (on-chain) is the standard, anyone who has crypto has heard of it and probably has some. Its available on every crypto exchange can even be bought through ATMs.

In reality, the long time between blocks (10 minutes) means when the network is busy it can take a very long time for transactions to confirm, sometimes many hours. Its also rather expensive for low cost items. This makes it difficult to use on-chain transactions in a retail environment.

Bitcoin can also be sent via the Lightning Network, these transactions confirm instantly and costs are negligable.

To accept payments over the Lightning Network zatsuma must also have a Bitcoin node, this makes it possible to accept on-chain payments so both methods are available.


## Transferring Funds

Funds received by Zatsuma are stored in the shop node wallet, this should be considered a 'hot wallet' and treated as if it were a cash register. 

Its important siginificant funds are not allowed to accumulate in the shop wallet. Its best to send them to safe storage, perhaps a paper or hardware wallet. You may also wish to send them to an exchange where they can be sold for FIAT.

Zatsuma can only use commands that are 'whitelisted' and this excludes all that send funds, however those commands are available through the RPC or gRPC clients provided with the node.

You can also use graphical wallets such as ZECwallet & bitcoin-qt.


## How To Get Help

Zatsuma was created for Zcash, funded by the Zcash Foundation (ZFgrants) and evolves on the Zcash Community Forum.

Feel free to join the forum & post questions. There's no official support but you can ask for ChileBob :-)

