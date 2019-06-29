# Zatsuma : Zcash Point-Of-Sale

My imaginary use case was a market stall selling vegetables, the owner wants his customers to pay with crypto but doesn't trust his sales people with access to his wallet. It would also work well for a bar, a shop, girl-scouts selling cookies, anywhere that sales are made face to face.

Another important feature was there should be no central service to process transactions. All funds received must go directly to the shop wallet and there must be no service fees, commission charges or central point of failure.

Zatsuma does simple order processing, checks for payments received & a few other things, but as it can ONLY receive funds the shop owner doesn't have to trust anyone. The shop is fully controlled and operated by the shop owner.

The salesperson uses Zatsuma on their phone, which connects to a server (ie: a laptop) that the owner leaves running at home. 

Here's a summary of what it does :-

- No hosting required, uses dynamic DNS
- Sales staff use their own phone, tablet or browser
- No intermediaries, funds go directly to the owners wallet
- Orders are created in FIAT amount, almost all 'fiat-forks' (USD/EUR/CLP/etc) are supported
- The customer scans a payment QRcode with their wallet
- Simple messaging between sales staff
- Can receive feedback from customers via memos (ie: visitors book, tips, etc)
- Designed for Zcash (ZEC), both transparent and SHIELDED payments
  ...also supports Bitcoin (BTC) via on-chain or Lightning Network

This project has been funded via ZF Grants (https://grants.zfnd.org) - thanks to the Zcash Foundation (https://zfnd.org)

More information and discussion can be found on the Zcash Community Forum, here's a link :-

https://forum.zcashcommunity.com/zcash-point-of-sale-prototype-funded/

Here's what the checkout looks like :-

![alt text](https://github.com/ChileBob/Zatsuma/blob/master/screenshots/checkout.png "Zatsuma Checkout")

# System Requirements

Server :-

- Ubuntu Linux 
- 8Gb RAM recommended (5Gb minimum)
- 500Gb Storage (more is better, blockchains are big)

[Installation Guide](https://github.com/ChileBob/Zatsuma/blob/master/INSTALL.md)

Client :-

- Smartphone
- Tablet
- Browser
