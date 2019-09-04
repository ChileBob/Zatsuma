// IMPORTANT !!!!
//
// The Software is provided 'as is', without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, 
// fitness for a particular purpose and non-infringement.
//
// In no event shall the authors or copyright holders be liable for any claim, damages or other liability, wether in an action of contract, 
// tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software.

// CHANGE THIS TO MATCH YOUR INSTALLATION

var shopAPI = 'http://zatsuma.localhost/cgi-bin/zatsuma.cgi';					// shop proxy - delete this line after installation

// #######################################################################################################################################################
// DONT CHANGE ANYTHING BELOW THIS LINE

var cacheDISPLAY = {										// display object cache
	menu: 0,										// 1 = menu shown, 0 = hidden
	coloractive: '#7a2ed0',									// active button colour
	colorinactive: '#2e7ad0',								// inactive button colour
	backgroundselected: '#2e7ad0',								// active background colour 
	backgroundunselected: '#000000',							// inactive background colour
	wallet: 'ZECZ',										// default wallet
	divname: '',										// current div, can be replaced by event driven updates
	exchCOIN: 0										// array index of coin/fiat rate to show on checkout
};

var cacheCONFIG = new Object;									// shop config
var cacheUSER   = new Object;									// user config
var cacheNODE   = new Object;									// node status
var cacheORDER  = new Object;									// active order

var cacheEXCH   = new Object;									// exchange rates
var exchCOIN    = new Array('ZEC', 'YEC', 'BTC');						// supported coins
var exchRATE    = new Array(0, 0, 0);								// last seen exchange rate

var cacheCOIN   = {										// cache of current coin image
	CASH:  'disabled',
	ZECT:  'disabled',
	ZECZ:  'disabled',
	YECS:  'disabled',
	YECY:  'disabled',
	BTC:   'disabled',
	BTCLN: 'disabled'
};

var cacheNOTIFY = {										// cache of last notification times
	orders: 0,
	users: 0,
	message: 0
};

var cacheCALC = {										// checkout calculator vars
	inputstring: '0',
	tempstring: ''
};

var cacheMESG = {										// message compose
	user_to: 0
};


var timerCONFIG = {										// timer for autoupdates
	fast: 5,										// fast updates
	slow: 15,										// normal updates
	ticktime: 200,										// ticks per second
	seconds: 0,										// seconds elapsed since reset
	seconds_reset: 15,									// start with 15 second cycles
	minutes: 0.0,										// minutes since reset
	minutes_reset: 1.0,									// minutes elapsed since reset
	ticks: 0										// timer tick counter
};

var timer = setInterval(T_update, timerCONFIG.ticktime);					// start autoupdate timer

var divLoginIMAGE = new Image();
var divLoginSprite, canvasLogin;
divLoginCONFIG = {								
	eye: {											// eyeball positions
		right: { 
			center: { X: 122, Y: 21 }, 						// center position
			pos: { X: 0, Y: 0 },							// current position
			max: { X: 5, Y: 7 },							// limits
			min: { X: -8, Y: -7 }						
		},
		left:  { 
			center: { X:  98, Y: 20 }, 
			pos: { X: 0, Y: 0 },
			max: { X: 5, Y: 2 },
			min: { X: -8, Y: -7 }
		}
	},
	imgsrc: './images/divLoginSprite.png',
	display: true,												// display, animation disabled when not shown
	imgheight: 180,
	imgwidth: 800,
	frames: 4,
	ticksPerFrame: 4
};

var divErrorIMAGE = new Image();
var divErrorSprite, canvasError;
divErrorCONFIG = {
 	eye: {													// eyeball positions 
 		right: { 
 			center: { X: 66, Y: 50 }, 								// center position
 			pos: { X: 0, Y: 0 },									// current position
 			max: { X: 10, Y: 3 },									// limits
 			min: { X: -6, Y: -10 }						
 		},
 		left:  { 
 			center: { X:  48, Y: 60 }, 
			pos: { X: 0, Y: 0 },
			max: { X: 3, Y: 2 },
 			min: { X: -8, Y: -5 }
 		}
 	},
 	imgsrc: './images/divErrorSprite.png',
 	display: true,												// display, animation disabled when not shown
 	imgheight: 240,
 	imgwidth: 1400,
 	frames: 4,
	ticksPerFrame: 4
};

document.addEventListener('DOMContentLoaded', init, false);							// startup

window.onresize = function() { D_onresize(); }									// window resize event handler

// ******************************************************************************************************************************************************************
//
function init() {
	D_onresize();												// check window size
	D_showdiv('Splash');
	document.getElementById('divTitleText').innerHTML = 'Connecting...';

	canvasLogin = document.getElementById('canvasLogin');							// initialise dog on home page
	canvasLogin.width = 200;
	canvasLogin.height = 180;

	divLoginSprite = sprite({										
		context: canvasLogin.getContext("2d"),
		width: divLoginCONFIG.imgwidth,
		height: divLoginCONFIG.imgheight,
		image: divLoginIMAGE,
		numberOfFrames: divLoginCONFIG.frames,
		ticksPerFrame: divLoginCONFIG.ticksPerFrame
	});

	divLoginIMAGE.addEventListener("load", spriteEyesDraw('canvasLogin', divLoginCONFIG));
	divLoginIMAGE.src = divLoginCONFIG.imgsrc;

	canvasError = document.getElementById('canvasError');							// initialise dog on error page
	canvasError.width = 350;
	canvasError.height = 240;

	divErrorSprite = sprite({										
		context: canvasError.getContext("2d"),
		width: divErrorCONFIG.imgwidth,
		height: divErrorCONFIG.imgheight,
		image: divErrorIMAGE,
		numberOfFrames: divErrorCONFIG.frames,
		ticksPerFrame: divErrorCONFIG.ticksPerFrame
	});

	divErrorIMAGE.addEventListener("load", spriteEyesDraw('canvasError', divErrorCONFIG));
	divErrorIMAGE.src = divErrorCONFIG.imgsrc;
	
	jsonCOMMAND( { req:'config_get' } );									// get configuration
	jsonCOMMAND( { req:'user_connect' } );									// connect to proxy
}


// ******************************************************************************************************************************************************************
//
function B_wallet(button) {											// Wallet buttons

	cacheDISPLAY.wallet = button;										// cache selected wallet

	var coinList = new Array('ZECT', 'ZECZ', 'BTC', 'BTCLN', 'CASH', 'YECS', 'YECY');			// supported coins

	document.getElementById('divWalletQRcode').innerHTML = '';						// clear QR code
	document.getElementById('divWalletAddress').innerHTML = '';

	for (var i = 0; i < coinList.length; i++) {								// select/deselect coin
		if (coinList[i] == button) {
			document.getElementById('divWallet' + coinList[i]).style.background = cacheDISPLAY.backgroundselected;	
		}
		else {
			document.getElementById('divWallet' + coinList[i]).style.background = cacheDISPLAY.backgroundunselected;	
		}
	}

	if (button == 'CASH') {
		document.getElementById('divWalletQRcode').innerHTML = '<img src=\"images/piggybank-256x256.jpg\">';
	}
	if ( (button == 'ZECT') && (typeof cacheNODE.zec.config == 'object') ) {
		jQuery('#divWalletQRcode').qrcode ( encodeURI('zcash:' + cacheNODE.zec.config.taddr) );
		document.getElementById('divWalletAddress').innerHTML = cacheNODE.zec.config.taddr;
	}
	if ( (button == 'ZECZ') && (typeof cacheNODE.zec.config == 'object') ) {
		jQuery('#divWalletQRcode').qrcode ( encodeURI('zcash:' + cacheNODE.zec.config.zaddr) );
		document.getElementById('divWalletAddress').innerHTML = cacheNODE.zec.config.zaddr;
	}
	if ( (button == 'YECS') && (typeof cacheNODE.yec.config == 'object') ) {
		jQuery('#divWalletQRcode').qrcode ( encodeURI('ycash:' + cacheNODE.yec.config.saddr) );
		document.getElementById('divWalletAddress').innerHTML = cacheNODE.yec.config.saddr;
	}
	if ( (button == 'YECY') && (typeof cacheNODE.yec.config == 'object') ) {
		jQuery('#divWalletQRcode').qrcode ( encodeURI('ycash:' + cacheNODE.yec.config.yaddr) );
		document.getElementById('divWalletAddress').innerHTML = cacheNODE.yec.config.yaddr;
	}
	if ( (button == 'BTC') && (typeof cacheNODE.btc.config == 'object') ) {
		jQuery('#divWalletQRcode').qrcode ( encodeURI('bitcoin:' + cacheNODE.btc.config.addr) );
		document.getElementById('divWalletAddress').innerHTML = cacheNODE.btc.config.addr;
	}
	if ( (button == 'BTCLN') && (typeof cacheNODE.btcln.config == 'object') ) {
		jQuery('#divWalletQRcode').qrcode ( encodeURI(cacheNODE.btcln.config.addr) );
		document.getElementById('divWalletAddress').innerHTML = cacheNODE.btcln.config.addr;
	}
}

// ******************************************************************************************************************************************************************
//
function B_menu(button) {											// Menu button

	var menuList = new Array('Login', 'Checkout', 'Wallet', 'Users', 'Orders', 'Messages', 'Status', 'About', 'Logout', 'View');	// menu items

	var menuPublic = new Array(1, 0, 0, 0, 0, 0, 0, 1, 0, 1);						// menu items for each user type
	var menuUser = new Array(0, 1, 0, 0, 1, 1, 1, 1, 1, 1);				
	var menuAdmin = new Array(0, 1, 1, 1, 1, 1, 1, 1, 1, 1);			

	for( var i = 0; i < menuList.length; i++) {								// build the menu
		if (cacheUSER.privilege == 0) {									// guest menu
			if (menuPublic[i] == 1) {
				document.getElementById('divMenu' + menuList[i]).style.display = 'block';
			}
			else {
				document.getElementById('divMenu' + menuList[i]).style.display = 'none';
			}
		}
		else if (cacheUSER.privilege == 10) {								// user menu
			if (menuUser[i] == 1) {
				document.getElementById('divMenu' + menuList[i]).style.display = 'block';
			}
			else {
				document.getElementById('divMenu' + menuList[i]).style.display = 'none';
			}
		}				
		else if (cacheUSER.privilege == 100) {								// admin menu
			if (menuAdmin[i] == 1) {							
				document.getElementById('divMenu' + menuList[i]).style.display = 'block';
			}
			else {
				document.getElementById('divMenu' + menuList[i]).style.display = 'none';
			}
		}
	}


	if (typeof button == 'undefined') {									// menu img was clicked
		if (cacheDISPLAY.menu == 0) {
			document.getElementById('divMenu').style.display = 'block';
			cacheDISPLAY.menu = 1;
		}
		else {												// menu button was clicked again
			document.getElementById('divMenu').style.display = 'none';
			cacheDISPLAY.menu = 0;
		}


	}
	else {	
		if (button == cacheDISPLAY.divname) {								// current div was selected, so just hide the menu
			document.getElementById('divMenu').style.display = 'none';
			cacheDISPLAY.menu = 0;
		}
		else if (button == 'Logout') {									// logout clicked
			document.getElementById('divTitleText').innerHTML = cacheCONFIG.shopname;		// reset page title
			document.getElementById('divMenu').style.display = 'none';				// hide menu
			cacheDISPLAY.menu = 0;
			D_showdiv('Login');
			jsonCOMMAND({ req:'user_logout' });							// logout from server

		}
		else if (button == 'Messages') {								// fetch message inbox
			jsonCOMMAND({ req:'user_list' });							// send command
			jsonCOMMAND({ req:'mesg_inbox' });							// send command
			D_showdiv(button);
		}

		else if (button == 'View') {									// fetch list of all orders
			jsonCOMMAND({ req:'order_list' });							// send command
			D_showdiv(button);
		}

		else if (button == 'Orders') {									// fetch list of all users orders
			jsonCOMMAND({ req:'order_user' });							// send command
			D_showdiv(button);
		}
		else if (button == 'Users') {									// fetch list of active users
			jsonCOMMAND({ req:'user_list' });							// send command
			D_showdiv(button);
		}
		else if (button == 'Status') {									// fetch node status
			jsonCOMMAND({ req:'status_get' });							// send command
			D_showdiv(button);
		}
		else if (button == 'Wallet') {									// fetch shop wallet balances
			jsonCOMMAND({ req:'wallet_balance' });							// send command
			D_showdiv(button);
		}
		else {
			D_showdiv(button);
		}
	}
	timerCONFIG.seconds = 0;										// Reset the timer
	timerCONFIG.minutes = 0.0;
}

// ******************************************************************************************************************************************************************
//														Alert button on title bar
function B_alert(type) {							
	console.log('B_alert() : alert = ' + type);
	document.getElementById('divTitleAlert').innerHTML = '';						// clear button on titlebar

	if ( type == 'message') {										// users message inbox
		if (cacheDISPLAY.showdiv != 'Messages') {
			D_showdiv('Messages');
		}
		jsonCOMMAND({ req:'mesg_inbox' });
	}
	else if ( type == 'orders') {										// user list of orders
		jsonCOMMAND( { req:'order_user' } );				
	}
	else if ( type == 'users') {										// list of active users
		if (cacheDISPLAY.showdiv != 'Users') {
			D_showdiv('Users');
		}
		jsonCOMMAND({ req:'user_list' });			
	}
}

// ******************************************************************************************************************************************************************
//														Button functions for messages
function B_mesg(action, idx) {							

	if (action == 'del') {											// delete message
		jsonCOMMAND({ req:'mesg_del', mesg_idx: idx });				
	}
	if (action == 'select') {										// message compose, select user
		cacheMESG.user_to = idx;
	}
	if (action == 'send') {											// send message
		if (document.getElementById('E_Messages_Content').value.length > 0) {
			jsonCOMMAND({ req:'mesg_send', user_rx: cacheMESG.user_to, content: truncate(document.getElementById('E_Messages_Content').value, 256)} );
		}
	}
}
//
// ******************************************************************************************************************************************************************
//														Button functions for messages
function B_order(action, ordernumber) {							

	console.log('B_order() : action=' + action + ', ordernumber = ' + ordernumber);

	if (action == 'show') {											// order selected from 'My Orders' list
		jsonCOMMAND( { req:'order_get', ordernumber: ordernumber } );				
		D_showdiv('Order');
	}
	else if (action == 'cancel') {										// cancel order (only works if no notification/confirmation)
		jsonCOMMAND( { req:'order_update', action: 'cancel', ordernumber: ordernumber } );				
	}
	else if (action == 'accept') {										// accept order (only works for active CASH order)
		jsonCOMMAND( { req:'order_update', action: 'accept', ordernumber: ordernumber } );				
	}
}


// ******************************************************************************************************************************************************************
//
function B_calc(digit, downup) {										// calculator button handler

	if (downup == 1) {											// button clicked

		if (cacheCALC.inputstring == 'Error') {								// clear error message
			cacheCALC.inputstring = '0';
		}

		document.getElementById('calc' + digit).style.backgroundColor = cacheDISPLAY.coloractive;

		if(isNaN(digit) == 1) {										// non-numeric pressed
			if (digit == 'DEL') {									// delete key
				if (cacheCALC.inputstring.length == 0) {					// already deleted, so reset to zero
					cacheCALC.inputstring = '0';
				}
				else {
					cacheCALC.tempstring = cacheCALC.inputstring.substring(0, cacheCALC.inputstring.length - 1);
					if (cacheCALC.tempstring.length > 0) {
						cacheCALC.inputstring = cacheCALC.tempstring;
					}
					else {
						cacheCALC.inputstring = '0';
					}
				}
				calculate_exch();							// update calculator exchange rate
			}
			else if (digit == 'DOT') {								// decimal place
				if (cacheCALC.inputstring.substr(cacheCALC.inputstring.length - 1, 1) != '.') {	// dont allow double decimal dots
					cacheCALC.inputstring += '.';
				}
			}
			else if (digit == 'CLEAR') {								// clear button
				cacheCALC.inputstring = '0';
				calculate_exch();								// update calculator exchange rate
			}
			else if (digit == 'EQUAL') {								// equals button 
				calculate(cacheCALC.inputstring);
			}

			else {
				if ( cacheCALC.inputstring.charAt(0) != '-') {					// first number is not signed, so do the math
					calculate(cacheCALC.inputstring);
				}
				else {										// first number signed
					var trimmed = cacheCALC.inputstring.substr(1, cacheCALC.inputstring.length - 1);
					if (trimmed.search(/[\+,\-,\x,\/]/) != -1) {				// already has an operator, so do the math
						calculate(cacheCALC.inputstring);
					}
				}

				if (cacheCALC.inputstring != 'Error') {
					if (digit == 'PLUS') {							// now add the next operator, if we're not showing an error
						cacheCALC.inputstring += '+';
					}
					else if (digit == 'MINUS') {	
						cacheCALC.inputstring += '-';
					}
					else if (digit == 'MULTIPLY') {	
						cacheCALC.inputstring += 'x';
					}
					else if (digit == 'DIVIDE') {	
						cacheCALC.inputstring += '/';
					}
				}
			}
		}

		else {												// number pressed
			if ((cacheCALC.inputstring).length > 14) { 							// Limit calc display length to to prevent breaking UI
				cacheCALC.inputstring = 'Error';
			}
			else {
				if (cacheCALC.inputstring == '0') {							// calulator total is ZERO, change to pressed digit
					cacheCALC.inputstring = digit;
				}
				else {											// append digit to string
					cacheCALC.inputstring += digit;
				}
			}
			calculate_exch();									// update calculator exchange rate
		}

		document.getElementById('E_checkoutFIATamount').innerHTML = cacheCALC.inputstring;		// update the calculator display
		if (cacheCALC.inputstring == 'Error') {									// clear cypto amounts if there's an error
			document.getElementById('E_checkoutZECamount').innerHTML = '0.00000000</br>ZEC';
			document.getElementById('E_checkoutYECamount').innerHTML = '0.00000000</br>YEC';
			document.getElementById('E_checkoutBTCamount').innerHTML = '0.00000000</br>BTC';
		}
	}

	else {													// button released
		document.getElementById('calc' + digit).style.backgroundColor = cacheDISPLAY.colorinactive;
	}
}


// -----------------------------------------------------------------------------------------------------------------------------------------------------
// calculator button press
//
function calculate(inputstr) {

	var op;
	var res;

	if (inputstr.charAt(0) == '-') {							// first number is signed
		var trimmed = inputstr.substr(1, inputstr.length - 1);				

		op = trimmed.charAt(trimmed.search(/[\+,\-,\x,\/]/));
		res = trimmed.split(op);
		res[0] = '-' + res[0];
	}
	else {											// fist numbe is unsigned
		op = inputstr.charAt(inputstr.search(/[\+,\-,\x,\/]/));
		res = inputstr.split(op);
	}

	if (op == '+') {									// do the math
		cacheCALC.inputstring = parseFloat(Number(res[0]) + Number(res[1]));
	}
	else if (op == '-') {
		cacheCALC.inputstring = parseFloat(Number(res[0]) - Number(res[1]));
	}
	else if (op == 'x') {
		cacheCALC.inputstring = parseFloat(Number(res[0]) * Number(res[1]));
	}
	else if (op == '\/') {									// division
		if(res[1] == 0) {								// catch division by zero
			cacheCALC.inputstring = 'Error';
		}
		else {
			cacheCALC.inputstring = parseFloat(Number(res[0]) / Number(res[1]));
		}
	}

	// todo: change css to allow scrolling calculator display

	if (typeof cacheCALC.inputstring != 'string') {						// make sure we always return a string

		var tmpstr = cacheCALC.inputstring.toFixed(2);					// limit to 8 decimal places, should be plenty
		cacheCALC.inputstring = tmpstr;
	}

	calculate_exch();									// update calculator exchange rate
}

// -----------------------------------------------------------------------------------------------------------------------------------------------------
// update calculator ZEC & BTC amounts
//
function calculate_exch() {

	if (cacheEXCH.status == 1) {								// check we have exchange rate data
		if (isNaN(cacheCALC.inputstring) == false) {			
			document.getElementById('E_checkoutZECamount').innerHTML = Number(cacheCALC.inputstring / cacheEXCH.ZEC).toFixed(8) + ' ZEC';
			document.getElementById('E_checkoutYECamount').innerHTML = Number(cacheCALC.inputstring / cacheEXCH.YEC).toFixed(8) + ' YEC';
			document.getElementById('E_checkoutBTCamount').innerHTML = Number(cacheCALC.inputstring / cacheEXCH.BTC).toFixed(8) + ' BTC';

			// TODO: Check min/max order value for each payment method & update checkout coin images to show status
		}
	}
	else {											// we dont, so tell the user
		document.getElementById('E_checkoutZECamount').innerHTML = 'No Data';
		document.getElementById('E_checkoutYECamount').innerHTML = 'No Data';
		document.getElementById('E_checkoutBTCamount').innerHTML = 'No Data';

		// TODO: Change checkout coin images to 'disabled'
	}
	if (cacheCALC.inputstring == 'Error') {							// calculator showing error
		document.getElementById('E_checkoutZECamount').innerHTML = '0.00000000</br>ZEC';
		document.getElementById('E_checkoutYECamount').innerHTML = '0.00000000</br>YEC';
		document.getElementById('E_checkoutBTCamount').innerHTML = '0.00000000</br>BTC';

		// TODO: Change checkout coin images to 'disabled'
	}

	D_checkout_coin();									// update coin graphics based on order value

}

// ******************************************************************************************************************************************************************
//
function B_checkout(coin) {									// Checkout coin button
	console.log('B_checkout() : coin = ' + coin);

	var coinamount;

	if( isNaN(cacheCALC.inputstring) || (cacheCALC.inputstring == 0) ) {			// calc is zero or part way through a calc
		var audio = new Audio('audio/cancel.mp3');					// play sound
		audio.play();
	}
	else {
		if (coin == 'ZECZ' || coin == 'ZECT') {						// new ZEC order
			coinamount = (cacheCALC.inputstring / cacheEXCH.ZEC).toFixed(8);
		}
		else if (coin == 'BTC' || coin == 'BTCLN') {					// new BTC order
			coinamount = (cacheCALC.inputstring / cacheEXCH.BTC).toFixed(8);
		}
		else if (coin == 'YECS' || coin == 'YECY') {					// new YEC order
			coinamount = (cacheCALC.inputstring / cacheEXCH.YEC).toFixed(8);
		}
		else if (coin == 'CASH') {							// new cash order
			coinamount = cacheCALC.inputstring;
		}

		if (isNaN(coinamount) ) {
			document.getElementById('E_checkoutFIATamount').innerHTML = 'No Exch Rates';
			var audio = new Audio('audio/cancel.mp3');				// play sound
			audio.play();
		}
		else {

			jsonCOMMAND({ 
				req: 'order_new', 
				coin: coin, 
				coinamount: coinamount, 
				fiat: cacheCONFIG.fiat,
				fiatamount: cacheCALC.inputstring
			});										// send command
		}
	}
}

// ******************************************************************************************************************************************************************
//
function B_login(type) {									// Login div buttons

	if (type == 'login') {
		jsonCOMMAND({ 										// send command 
			req:'user_login', 
			username: document.getElementById('E_login_username').value,	
			password: document.getElementById('E_login_password').value
		});
	}
	if (type == 'guest') {
		jsonCOMMAND({ 										// send command 
			req:'user_guest', 
			username: document.getElementById('E_login_username').value,	
			password: document.getElementById('E_login_password').value	
		});
	}

	if (type == 'eyeball') {									// show/hide password
		if (document.getElementById('E_login_password').type == 'password') {
			document.getElementById('E_login_password').type = 'text';
		}
		else {
			document.getElementById('E_login_password').type = 'password';
		}
	}
}


// FUNCTIONS RELATED JSON
//
// ******************************************************************************************************************************************************************
function jsonCOMMAND(command) {									// Reqeust data from shopd

	var reqJSON = {};
	reqJSON.cmd = JSON.stringify(command);							// convert command string into JSON
	reqJSON.cmd = command;									// convert command string into JSON
	reqJSON.session = getCookie('session');							// add the session cookie

	$.ajax({
		type: 'POST',
		url: shopAPI,
		data: reqJSON,
		dataType: 'json'
	})
	.done(function(data) {									// handle shopd responses
		
		if (data.error == 'down') {
			console.log('no connection to proxy server..');
			document.getElementById('divTitleText').innerHTML = 'Technical Problem';		// set page title
			document.getElementById('divErrorMessage').innerHTML = 'Could not connect to server!'	// appropriate error message
			D_showdiv('Error');
		}
		else {
			// TODO: The coins flicker, should only change status when necessary
			// TODO: Should show error page if ZEC is offline, its required !
			//
			if ( (typeof cacheNODE.zec != 'undefined') && (typeof cacheNODE.zec.config == 'object') && (cacheCONFIG.zect_allow == 1) ) {		// Transaparent ZEC
				document.getElementById('divWalletZECT').style.display = 'inline-block';
				document.getElementById('divCheckoutZECT').style.display = 'inline-block';
			}
			else {
				document.getElementById('divWalletZECT').style.display = 'none';
				document.getElementById('divCheckoutZECT').style.display = 'none';
			}

			if ( (typeof cacheNODE.zec != 'undefined') && (typeof cacheNODE.zec.config == 'object') && (cacheCONFIG.zecz_allow == 1) ) {		// Shielded ZEC
				document.getElementById('divWalletZECZ').style.display = 'inline-block';
				document.getElementById('divCheckoutZECZ').style.display = 'inline-block';
			}
			else {
				document.getElementById('divWalletZECZ').style.display = 'none';
				document.getElementById('divCheckoutZECZ').style.display = 'none';
			}

			if ( (typeof cacheNODE.yec != 'undefined') && (typeof cacheNODE.yec.config == 'object') && (cacheCONFIG.yecs_allow == 1) ) {		// Transaparent YEC
				document.getElementById('divWalletYECS').style.display = 'inline-block';
				document.getElementById('divCheckoutYECS').style.display = 'inline-block';
			}
			else {
				document.getElementById('divWalletYECS').style.display = 'none';
				document.getElementById('divCheckoutYECS').style.display = 'none';
			}

			if ( (typeof cacheNODE.yec != 'undefined') && (typeof cacheNODE.yec.config == 'object') && (cacheCONFIG.yecy_allow == 1) ) {		// Shielded YEC
				document.getElementById('divWalletYECY').style.display = 'inline-block';
				document.getElementById('divCheckoutYECY').style.display = 'inline-block';
			}
			else {
				document.getElementById('divWalletYECY').style.display = 'none';
				document.getElementById('divCheckoutYECY').style.display = 'none';
			}

			if ( (typeof cacheNODE.btc != 'undefined') && (typeof cacheNODE.btc.config == 'object') && (cacheCONFIG.btc_allow == 1) ) {		// Bitcoin OnChain
				document.getElementById('divWalletBTC').style.display = 'inline-block';
				document.getElementById('divCheckoutBTC').style.display = 'inline-block';
			}
			else {
				document.getElementById('divWalletBTC').style.display = 'none';
				document.getElementById('divCheckoutBTC').style.display = 'none';
			}

			if ( (typeof cacheNODE.btcln != 'undefined') && (typeof cacheNODE.btcln.config == 'object') && (cacheCONFIG.btcln_allow ==1) ) {	// Bitcoin Lightning
				document.getElementById('divWalletBTCLN').style.display = 'inline-block';
				document.getElementById('divCheckoutBTCLN').style.display = 'inline-block';
			}
			else {
				document.getElementById('divWalletBTCLN').style.display = 'none';
				document.getElementById('divCheckoutBTCLN').style.display = 'none';
			}


			if ( (cacheUSER.privilege > 0) && (data.user.privilege != cacheUSER.privilege)) {	// make sure the user still has a valid session (ie: not logged in from elsewhere)
				user_logout('You have been logged out by the server.');
			}

			// *************************************************************************************************************************************
			if (typeof data.config_get != 'undefined') {						// shop configuration

				cacheCONFIG = data.config_get;
				cacheNODE = data.node;
				
				document.getElementById('divTitleText').innerHTML = cacheCONFIG.shopname;		// set title to shopname
				document.getElementById('E_checkoutFIAT').innerHTML = cacheCONFIG.fiat;			// set checkout fiat
				document.getElementById('E_checkoutFIAT_coin').innerHTML = cacheCONFIG.fiat;		// set checkout fiat symbol on coin

				document.getElementById('divViewQRcode').innerHTML = '';				// clear QR code
				if ( (cacheCONFIG.zecz_allow == 1) && (typeof cacheNODE.zec.config.zaddr != 'undefined') ) {	// set memo zaddr if allowed & node is online
					jQuery('#divViewQRcode').qrcode ( encodeURI('zcash:' + cacheNODE.zec.config.zaddr) );
					document.getElementById('divViewGuestbook').style.display = 'block';
				}
				else {
					document.getElementById('divViewGuestbook').style.display = 'none';		// hide the div
				}

				if (cacheDISPLAY.divname == 'Error') {							// clear error page if thats showing
					D_showdiv('Checkout');
				}
				B_wallet(cacheDISPLAY.wallet);								// update QR codes/addresses for selected wallet
				
			}

			// *************************************************************************************************************************************
			if (typeof data.user_connect != 'undefined') {						// connect to shopd, called by init
				cacheUSER = data.user_connect;								// cache user data
				cacheNODE = data.node;									// cache node config
				cacheEXCH = data.exch;									// cache exchange rates
	
				if (data.user_connect.status == 0) {							// login failed, show the login page
	
					document.getElementById('divTitleText').innerHTML = cacheCONFIG.shopname;	// show shopname in title
					document.getElementById('E_login_username').value = '';				// clear login credentials
					document.getElementById('E_login_password').value = '';
					if (cacheCONFIG.allow_guest == 1) {
						document.getElementById('divLoginMessage').innerHTML = 'Please login or create a new guest account.';
						document.getElementById('E_login_guest').style.display = 'inline-block';	// show guest button
						document.getElementById('E_login_eye').style.display = 'inline-block';		// show password eyeball
					}
					else {
						document.getElementById('divLoginMessage').innerHTML = '';
						document.getElementById('E_login_guest').style.display = 'none';	// hide guest button
						document.getElementById('E_login_eye').style.display = 'none';		// hide login password
					}
					document.getElementById('divMenuLogout').style.display = 'none';		// hide logout menu
					D_showdiv('Login');								// show login div
				}
				else {
					cacheNOTIFY.users = data.notify.users;						// cache user alert timestamp so it doesnt trigger on this login
					B_wallet('ZECZ');								// select ZECZ as displayed shop wallet
					D_showdiv('Checkout');								// success, go to checkout
				}
			}
	
			// *************************************************************************************************************************************
			if (typeof data.user_login != 'undefined') {						// user login
				if (data.user_login.status == 1) {							// success
					cacheNOTIFY.users = data.notify.users;						// cache user alert timestamp so it doesnt ping on this login
					setCookie('session', data.user_login.session, 365);				// set cookie
					cacheUSER = data.user_login;							// cache user detail
					document.getElementById('divMenuLogin').style.display = 'none';			// hide login menu
					D_showdiv('Checkout');								// go to checkout
				}
				else {											// fail
					document.getElementById('divMenuLogin').style.display = 'block';		// show login menu
					document.getElementById('divLoginMessage').innerHTML = 'Username/Password Incorrect.';
					document.getElementById('E_login_username').value = '';				// clear login credentials
					document.getElementById('E_login_password').value = '';
				}
			}
	
			// *************************************************************************************************************************************
			if (typeof data.user_logout != 'undefined') {						// user logout
				user_logout('You have logged out.');
			}
	
			// *************************************************************************************************************************************
			if (typeof data.user_guest != 'undefined') {						// request guest account
				document.getElementById('E_login_username').value = data.user_guest.username;		// user credentials
				document.getElementById('E_login_password').value = data.user_guest.password;
				document.getElementById('divLoginMessage').innerHTML = '<p>Click the eyeball to reveal your password.</p><p>This is the ONLY time your password will be available.</p><p>Click Login to continue.</p>';
			}
	
			// *************************************************************************************************************************************
			if (typeof data.user_list != 'undefined') {						// list of active users
				var user_select = '<select id=\"E_Messages_Userlist\" onchange=\"B_mesg(\'select\', this.value);\">\n';
				user_select += '<option value=\"\" selected>All Users</option>\n';

				var user_list = '<table width=\"100%\">';
				for ( var i = 0; i <data.user_list.user.length; i++) {					// generate table for users
					var user = data.user_list.user[i];
					var background = '#000000';
					if ((unixtime() - user[2]) < 60) {
						background = '#002700';
					}
					user_list += '<tr style=\"background-color:' + background + ';\"><td>' + user[1] + '</td></tr>\n';
					user_select += '<option value=\"' + user[0] + '\">' + user[1] + '</option>\n';
				}
				user_list += '</table>';
				user_select += "</select>\n";

				document.getElementById('divUsersList').innerHTML = user_list;				// update the user list div
				document.getElementById('divMessagesComposeSelect').innerHTML = user_select;		// update the user select for messages
			}
	
			// *************************************************************************************************************************************
			if (typeof data.mesg_inbox != 'undefined') {						// get user message inbox
				var updated = 0;
				var html;
				if (data.mesg_inbox.inbox.length == 0) {
					html = "<p>You have no messages.</p>";
				}
				else {
					html = '<table width=\"100%\">';
					for ( var i = 0; i <data.mesg_inbox.inbox.length; i++) {				// generate a table containing messages
						var mesg = data.mesg_inbox.inbox[i];
		
						if (mesg[3] > updated) {						// get most recent message timestamp
							updated = mesg[3];
						}
		
						var html_del = '<img src=\"images/delete-15x15.png\" onclick=\"B_mesg(\'del\',' + mesg[0] + ');\" title=\"Delete\">';
						var html_from = '<td onclick=\"B_mesg(\'reply\',' + mesg[0] + ');\" style=\"color:red;\">' + mesg[5] + '</td>';
						if (mesg[2] == 1) {
							html_del = '<img src=\"images/zect-15x15.png\" onclick=\"B_mesg(\'del\',' + mesg[0] + ');\" title=\"Delete\">';
							html_from = '<td style=\"color:green;\">Zcash Memo</td>';
						}
		
						html += '<tr>' + html_from + '<th>' + getDatetime(mesg[3]) + '</th><th>' + html_del + '</th></tr>\n';
						html += '<tr><td colspan="3">' + remove_non_ascii(mesg[8]) + '</td></tr>\n';
						html += '<tr><td colspan="3"><hr></td></tr>\n';
		
					}
					html += '</table>';
				}
				document.getElementById('divMessagesList').innerHTML = html;		
			}
			
			// *************************************************************************************************************************************
			if (typeof data.mesg_send != 'undefined') {						// send message
				if (data.mesg_send.status == 1) {							// success
					document.getElementById('E_Messages_Content').value = '';			// clear the message
					jsonCOMMAND({ req:'mesg_inbox' });						// refresh inbox
				}
			}
			
			// *************************************************************************************************************************************
			if (typeof data.mesg_del != 'undefined') {						// delete message
				jsonCOMMAND({ req:'mesg_inbox' });							// refresh inbox
			}
			
			// *************************************************************************************************************************************
			if (typeof data.order_new != 'undefined') {						// place new order
				console.log('jsonCOMMAND() : order_new');

				cacheORDER = data.order_new;							// cache the current order 
				timerCONFIG.seconds_reset = timerCONFIG.fast;					// faster updates
	
				console.log ('data.order_new.ordernumber = ' + data.order_new.ordernumber);

				var fiatamount = '';
				if (data.order_new.coin != 'CASH') {
					fiatamount = ' = ' + Number(data.order_new.coinamount).toFixed(8) + ' ' + String(data.order_new.coin).substring(0,3);
				}

				document.getElementById('E_Order_UserName').innerHTML = data.order_new.username;
				document.getElementById('E_Order_OrderNumber').innerHTML = data.order_new.ordernumber;
				document.getElementById('E_Order_Amount').innerHTML = Number(data.order_new.fiatamount).toFixed(2) + ' ' + data.order_new.fiat + fiatamount;
				document.getElementById('divOrderAddress').innerHTML = '';
				document.getElementById('E_Order_Confirmations').innerHTML = '';
	

				if (data.order_new.coin != 'CASH') {									// crypto payment, buttons depend on status & confirmations
					if (data.order_new.order_status == -2) {					
						document.getElementById('E_Order_Status').innerHTML = 'Cancelled';			// cancelled order
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/cancelled-256x256.png\" title=\"Order Expired\">';
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
					}
					else if (data.order_new.order_status == -1) {					
						document.getElementById('E_Order_Status').innerHTML = 'Cancelled';			// cancelled order
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/cancelled-256x256.png\" title=\"Order Cancelled\">';
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
					}
					else if (data.order_new.order_status == 0) {							// new order, no notification received 
						document.getElementById('E_Order_Status').innerHTML = 'Waiting for notification';
						document.getElementById('divOrderQRcode').innerHTML = '';				// show QR code
						jQuery('#divOrderQRcode').qrcode ( encodeURI(data.order_new.uri) );
						document.getElementById('divOrderAddress').innerHTML = encodeURI(data.order_new.uri);
						document.getElementById('E_Order_Confirmations').innerHTML = data.order_new.confirmations + ' / ' + data.order_new.conftarget;

						console.log('<button class=\"bigbutton\" onclick=\"B_order(\'cancel\', \'' + cacheORDER.ordernumber + '\');\">Cancel</button>');
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_order(\'cancel\', \'' + cacheORDER.ordernumber + '\');\">Cancel</button>';
					}
					else if (data.order_new.order_status == 1) {							// notification received but payment not confirmed
						// TODO: Need to display target confirmations & received so far
						document.getElementById('E_Order_Status').innerHTML = 'Waiting for confirmation';
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/unconfirmed-256x256.png\" title=\"Waiting for confirmation\">';	
						document.getElementById('E_Order_Confirmations').innerHTML = data.order_new.confirmations + ' / ' + data.order_new.conftarget;
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
					}
					else if (data.order_new.order_status == 2) {							// completed order, payment confirmed
						document.getElementById('E_Order_Status').innerHTML = 'Payment received';
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/confirmed-256x256.png\" title=\"Payment received!\">';	
						document.getElementById('E_Order_Confirmations').innerHTML = data.order_new.confirmations + ' / ' + data.order_new.conftarget;
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
					}
				}
				else {													// cash payment
					if (data.order_new.order_status == -2) {					
						document.getElementById('E_Order_Status').innerHTML = 'Order Expired';			// expired order
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/cancelled-256x256.png\" title=\"Order Cancelled\">';	
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
					}
					else if (data.order_new.order_status == -1) {					
						document.getElementById('E_Order_Status').innerHTML = 'Order Cancelled';		// cancelled order
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/cancelled-256x256.png\" title=\"Order Cancelled\">';	
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
					}
					else if (data.order_new.order_status == 0 || data.order_new.order_status == 1) {				// new order, customer hasn't paid yet
						document.getElementById('E_Order_Status').innerHTML = 'Waiting for payment';
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/piggybank-256x256.jpg\">';	// replace QRcode with cash graphic
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_order(\'cancel\',\'' + data.order_new.ordernumber + '\');\">Cancel</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_order(\'accept\',\'' + data.order_new.ordernumber + '\');\">Accept</button>';
					}
					else if (data.order_new.order_status == 2) {							// completed order, payment received
						document.getElementById('E_Order_Status').innerHTML = 'Payment Received';
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/confirmed-256x256.png\" title=\"Payment received!\">';	
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
					}

				}
				D_showdiv('Order');
			}
			
			// *************************************************************************************************************************************
			if (typeof data.order_update != 'undefined') {						// update order status (accept, cancel, etc)
				console.log('jsonCOMMAND() : order_update');

				if (cacheORDER.ordernumber == data.order_update.ordernumber) {			// this is the order thats being displayed
					// TODO: Update div
				}
				else {
					// TODO: Popup notification
				}

				// TODO: Play appropriate sound (cancelled, confirmed, etc)
			}
			
			// *************************************************************************************************************************************
			if (typeof data.order_get != 'undefined') {						// retreive order & switch to orders div
				console.log('jsonCOMMAND() : order_get');
				cacheORDER = data.order_get;							// update cache

				var fiatamount = '';								// format crypto & fiat amounts
				if (data.order_get.coin != 'CASH') {
					fiatamount = ' = ' + Number(data.order_get.coinamount).toFixed(8) + ' ' + String(data.order_get.coin).substring(0,3);
				}

				document.getElementById('E_Order_UserName').innerHTML = data.order_get.username;	// update order details
				document.getElementById('E_Order_OrderNumber').innerHTML = data.order_get.ordernumber;
				document.getElementById('E_Order_Confirmations').innerHTML = data.order_get.confirmations + ' / ' + data.order_get.conftarget;
				document.getElementById('E_Order_Amount').innerHTML = Number(data.order_get.fiatamount).toFixed(2) + ' ' + data.order_get.fiat + fiatamount;
				document.getElementById('divOrderAddress').innerHTML = '';				// clear payment address
				document.getElementById('divOrderQRcode').innerHTML = '';				// clear QRcode

				if (data.order_get.coin == 'CASH') {

					if (cacheORDER.status == -2) {						// cancelled order, show graphic & clear cache, buttons are 'checkout' & 'orders'
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/cancelled-256x256.png\">';
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
						document.getElementById('E_Order_Status').innerHTML = 'Order Expired';	
						cacheORDER.ordernumber = undefined;					// stop auto updates
						timerCONFIG.seconds_reset = timerCONFIG.slow;
					}
					else if (cacheORDER.status == -1) {					// cancelled order, show graphic & clear cache, buttons are 'checkout' & 'orders'
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/cancelled-256x256.png\">';
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
						document.getElementById('E_Order_Status').innerHTML = 'Order Cancelled';	
						cacheORDER.ordernumber = undefined;					// stop auto updates
						timerCONFIG.seconds_reset = timerCONFIG.slow;
					}
					else if (cacheORDER.status == 0) {
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/piggybank-256x256.jpg\">';
						document.getElementById('E_Order_Status').innerHTML = 'Waiting for payment';
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_order(\'cancel\',\'' + data.order_get.ordernumber + '\');\">Cancel</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_order(\'accept\',\'' + data.order_get.ordernumber + '\');\">Accept</button>';
						timerCONFIG.seconds_reset = timerCONFIG.fast;
					}
					else if (cacheORDER.status > 0 ) {					// payment received

						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/confirmed-256x256.png\">';
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
						document.getElementById('E_Order_Status').innerHTML = 'Payment Received';
						cacheORDER.ordernumber = undefined;					// stop auto updates
						timerCONFIG.seconds_reset = timerCONFIG.slow;
					}
				}
				else {
					if (cacheORDER.status == -2) {						// expired order, show graphic, buttons are 'checkout' & 'orders'
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/cancelled-256x256.png\">';
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
						document.getElementById('E_Order_Status').innerHTML = 'Order Expired';
						timerCONFIG.seconds_reset = timerCONFIG.slow;
					}
					else if (cacheORDER.status == -1) {					// cancelled order, show graphic & clear cache, buttons are 'checkout' & 'orders'
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/cancelled-256x256.png\">';
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
						document.getElementById('E_Order_Status').innerHTML = 'Order Cancelled';	
						cacheORDER.ordernumber = undefined;					// stop auto updates
						timerCONFIG.seconds_reset = timerCONFIG.slow;
					}
					else if (cacheORDER.status == 0) {					// new order
						jQuery('#divOrderQRcode').qrcode ( encodeURI(data.order_get.uri) );
						document.getElementById('divOrderAddress').innerHTML = encodeURI(data.order_get.uri);
						document.getElementById('E_Order_Status').innerHTML = 'Waiting for notification';	
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_order(\'cancel\',\'' + data.order_get.ordernumber + '\');\">Cancel</button>';
						timerCONFIG.seconds_reset = timerCONFIG.fast;
					}
					else if (cacheORDER.status == 1) {					// unconfirmed order, show graphic, buttons are 'checkout' & 'orders'
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/unconfirmed-256x256.png\">';
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
						document.getElementById('E_Order_Status').innerHTML = 'Waiting for confirmation';
						timerCONFIG.seconds_reset = timerCONFIG.fast;
					}
					else if (cacheORDER.status == 2) {					// confirmed order, show graphic & clear cache, buttons are 'checkout' & 'orders'
						document.getElementById('divOrderQRcode').innerHTML = '<img src=\"images/confirmed-256x256.png\">';
						document.getElementById('E_Order_Button').innerHTML = '<button class=\"bigbutton\" onclick=\"B_menu(\'Checkout\');\">Checkout</button>&nbsp;<button class=\"bigbutton\" onclick=\"B_menu(\'Orders\');\">Orders</button>';
						document.getElementById('E_Order_Status').innerHTML = 'Payment Received';
						cacheORDER.ordernumber = undefined;					// stop auto updates
						timerCONFIG.seconds_reset = timerCONFIG.slow;
					}
				}
			}
	
			// *************************************************************************************************************************************
			if (typeof data.order_user != 'undefined') {						// list users orders
	
				var html = '<table align=\"center\">';
				var updated = 0;
	
				if (typeof data.order_user.order == 'undefined') {
					html = '<p>No orders.</p>'
				}
				else {
					for ( var i = 0; i < data.order_user.order.length; i++) {					// generate a table showing all orders
						var order = data.order_user.order[i];
		
						if (order[5] > updated) {								// get timestamp of most recent update
							updated = order[5];
						}
		
						var coin;										// display order coin
						if (order[0] == 'ZECZ')       { coin = '<img src=\"images/zecz-15x15.png\">'; }
						else if (order[0] == 'ZECT')  { coin = '<img src=\"images/zect-15x15.png\">';  }
						else if (order[0] == 'YECS')  { coin = '<img src=\"images/yecs-15x15.png\">';  }
						else if (order[0] == 'YECY')  { coin = '<img src=\"images/yecy-15x15.png\">';  }
						else if (order[0] == 'BTC')   { coin = '<img src=\"images/btc-15x15.png\">';   }
						else if (order[0] == 'BTCLN') { coin = '<img src=\"images/btcln-15x15.png\">'; }
						else if (order[0] == 'CASH')  { coin = '<img src=\"images/cash-15x15.png\">';  }
	
						var background = '#002700';				// confirmed, green
						if (order[2] == 1) { background =       '#e49813'; } 	// unconfirmed, yellow
						else if (order[2] == 0) { background =  '#e49813'; }	// new, light yellow
						else if (order[2] == -1) { background = '#670000'; }	// cancelled, red
						else if (order[2] == -2) { background = '#270000'; }	// expired, dark red
		
						html += '<tr onclick=\"B_order(\'show\',\'' + order[1] + '\');\" style=\"background-color:' + background + '\";><td>' + coin + '</td><td>' + order[1] + '</td><td style=\"text-align:right;\">' + order[3].toFixed(2) + ' ' + order[4] +'</td></tr>\n';
					}
					html += '</table>\n';
				}
				document.getElementById('divOrdersList').innerHTML = html;		
			}
			
				// *************************************************************************************************************************************
			if ( (typeof data.order_list != 'undefined') && (typeof data.order_list.order != 'undefined') ) {								// list of all active orders
				var html = '<table align=\"center\">';
				var updated = 0;

				for ( var i = 0; i <data.order_list.order.length; i++) {					// generate a table showing all orders
					var order = data.order_list.order[i];
	
					if (order[4] > updated) {								// get timestamp of most recent update
						updated = order[4];
					}
	
					var coin;										// display order coin
					if (order[0] == 'ZECZ')       { coin = '<img src=\"images/zecz-15x15.png\">';  }
					else if (order[0] == 'ZECT')  { coin = '<img src=\"images/zect-15x15.png\">';  }
					else if (order[0] == 'YECS')  { coin = '<img src=\"images/yecs-15x15.png\">';  }
					else if (order[0] == 'YECY')  { coin = '<img src=\"images/yecy-15x15.png\">';  }
					else if (order[0] == 'BTC')   { coin = '<img src=\"images/btc-15x15.png\">';   }
					else if (order[0] == 'BTCLN') { coin = '<img src=\"images/btcln-15x15.png\">'; }
					else if (order[0] == 'CASH')  { coin = '<img src=\"images/cash-15x15.png\">';  }
	
					var background = '#002700';				// confirmed, green
					if (order[2] == 1) { background = '#e49813'; } 		// unconfirmed, yellow
					else if (order[2] == 0) { background = '#e49813'; }	// new, dark yellow
					else if (order[2] == -1) { background = '#670000'; }	// cancelled, red
					else if (order[2] == -2) { background = '#270000'; }	// expired, dark red
	
	
					html += '<tr style=\"background-color:' + background + '\";><td>' + coin + '</td><td>' + order[1] + '</td><td>' + order[3] + '</td></tr>\n';
				}
				html += '</table>\n';
				document.getElementById('divViewList').innerHTML = html;			// update the div
			}
			
			// *************************************************************************************************************************************
			if (typeof data.wallet_balance != 'undefined') {					// wallet balances
	
				var coinLIST = new Array('ZECT', 'ZECZ', 'BTC', 'BTCLN', 'YECS', 'YECY');	// clear balances
				for ( var i = 0; i < coinLIST.length; i++) {
					document.getElementById('E_wallet' + coinLIST[i] + 'amount').innerHTML = '0.00000000 ' + truncate(coinLIST[i], 3);	
					document.getElementById('E_wallet' + coinLIST[i] + 'fiat').innerHTML = '0.00 ' + cacheCONFIG.fiat;
				}
				document.getElementById('E_walletCASHamount').innerHTML = '0.00000000 ZEC';
				document.getElementById('E_walletCASHfiat').innerHTML = '0.00 ' + cacheCONFIG.fiat;
	
				
				for ( var i = 0; i <data.wallet_balance.length; i++) {					// update balances
					var balance = data.wallet_balance[i];
					if (balance[0] == 'CASH') {							// cash
						if (isNaN(cacheEXCH.ZEC)) {
							document.getElementById('E_walletCASHamount').innerHTML = 'No Data';
						}
						else {
							document.getElementById('E_walletCASHamount').innerHTML = (balance[1] / cacheEXCH.ZEC).toFixed(8) + ' ' + 'ZEC';			// show fiat as ZEC value :-)
						}
						document.getElementById('E_walletCASHfiat').innerHTML = balance[3] + ' ' + balance[2];	
					}
					else {										// crypto
						document.getElementById('E_wallet' + balance[0] + 'amount').innerHTML = balance[1] + ' ' + truncate(balance[0], 3);				// crypto amount	

						if ( (balance[0] == 'ZECT') || (balance[0] == 'ZECZ') ) {											// ZEC fiat value
							if (isNaN(cacheEXCH.ZEC)) {
								document.getElementById('E_wallet' + balance[0] + 'fiat').innerHTML = 'No Data';
							}
							else {
								document.getElementById('E_wallet' + balance[0] + 'fiat').innerHTML = (balance[1] * cacheEXCH.ZEC).toFixed(2) + ' ' + balance[2];
							}
						}
						if ( (balance[0] == 'BTC') || (balance[0] == 'BTCLN') ) {											// BTC fiat value
							if (isNaN(cacheEXCH.BTC) ) {
								document.getElementById('E_wallet' + balance[0] + 'fiat').innerHTML = 'No Data';
							}
							else {
								document.getElementById('E_wallet' + balance[0] + 'fiat').innerHTML = (balance[1] * cacheEXCH.BTC).toFixed(2) + ' ' + balance[2];
							}
						}
					}
				}
			}
			
			// *************************************************************************************************************************************
			if (typeof data.node != 'undefined') {							// node updates

				if ( (typeof data.node.zec != 'undefined') && (typeof data.node.zec.status == 'object' )) {
					var html;
					cacheNODE.zec.status = data.node.zec.status;
	
					html = '<table>\n';
					html += '<tr><th>Version</th><td align="right">' + data.node.zec.status.version + '</td></tr>\n';
					html += '<tr><th>Blocks</th><td align="right">' + data.node.zec.status.blocks + '</td></tr>\n';
					html += '<tr><th>Connections</th><td align="right">' + data.node.zec.status.connections + '</td></tr>\n';

					if (cacheCONFIG.zect_allow == 1) { html += '<tr><th>T-Addr Payments</th><td align="right">Enabled</td></tr>\n'; }
					else { html += '<tr><th>T-Addr Payments</th><td align="right">Disabled</td></tr>\n'; }

					if (cacheCONFIG.zecz_allow == 1) { html += '<tr><th>Z-Addr Payments</th><td align="right">Enabled</td></tr>\n'; }
					else { html += '<tr><th>Z-Addr Payments</th><td align="right">Disabled</td></tr>\n'; }

					html += '<tr><th>Max Zero-Conf Value</th><td align="right">' + Number(cacheCONFIG.zec_zeroconf).toFixed(2) + ' ' + cacheCONFIG.fiat + '</td></tr>\n';
					html += '<tr><th>Max Order Value</th><td align="right">Unlimited</td></tr>\n';
					html += '<tr><th>Min Order Value</th><td align="right">' + Number(cacheCONFIG.zec_minvalue).toFixed(2) + ' ' + cacheCONFIG.fiat + '</td></tr>\n';
					html += '</table>\n';
					document.getElementById('divStatusZEC').innerHTML = html;			// update the div
				}
			
				if ( (typeof data.node.yec != 'undefined') && (typeof data.node.yec.status == 'object' )) {
					var html;
					cacheNODE.yec.status = data.node.yec.status;
	
					html = '<table>\n';
					html += '<tr><th>Version</th><td align="right">' + data.node.yec.status.version + '</td></tr>\n';
					html += '<tr><th>Blocks</th><td align="right">' + data.node.yec.status.blocks + '</td></tr>\n';
					html += '<tr><th>Connections</th><td align="right">' + data.node.yec.status.connections + '</td></tr>\n';

					if (cacheCONFIG.yecs_allow == 1) { html += '<tr><th>S-Addr Payments</th><td align="right">Enabled</td></tr>\n'; }
					else { html += '<tr><th>S-Addr Payments</th><td align="right">Disabled</td></tr>\n'; }

					if (cacheCONFIG.yecy_allow == 1) { html += '<tr><th>Y-Addr Payments</th><td align="right">Enabled</td></tr>\n'; }
					else { html += '<tr><th>Y-Addr Payments</th><td align="right">Disabled</td></tr>\n'; }

					html += '<tr><th>Max Zero-Conf Value</th><td align="right">' + Number(cacheCONFIG.yec_zeroconf).toFixed(2) + ' ' + cacheCONFIG.fiat + '</td></tr>\n';
					html += '<tr><th>Max Order Value</th><td align="right">Unlimited</td></tr>\n';
					html += '<tr><th>Min Order Value</th><td align="right">' + Number(cacheCONFIG.yec_minvalue).toFixed(2) + ' ' + cacheCONFIG.fiat + '</td></tr>\n';
					html += '</table>\n';
					document.getElementById('divStatusYEC').innerHTML = html;			// update the div
				}
			
				if ( (typeof data.node.btc != 'undefined') && (typeof data.node.btc.status == 'object') ){
					var html;
					cacheNODE.btc.status = data.node.btc.status;
		
					html = '<table>\n';
					html += '<tr><th>Version</th><td align="right">' + data.node.btc.status.version + '</td></tr>\n';
					html += '<tr><th>Blocks</th><td align="right">' + data.node.btc.status.blocks + '</td></tr>\n';
					html += '<tr><th>Connections</th><td align="right">' + data.node.btc.status.connections + '</td></tr>\n';

					if (cacheCONFIG.btc_allow == 1) { 
						html += '<tr><th>On-Chain Payments</th><td align="right">Enabled</td></tr>\n'; 
					}
					else {
						html += '<tr><th>On-Chain Payments</th><td align="right">Disabled</td></tr>\n'; 
					}

					html += '<tr><th>Max Zero-Conf Value</th><td align="right">' + Number(cacheCONFIG.btc_zeroconf).toFixed(2) + ' ' + cacheCONFIG.fiat + '</td></tr>\n';
					html += '<tr><th>Max Order Value</th><td align="right">Unlimited</td></tr>\n';
					html += '<tr><th>Min Order Value</th><td align="right">' + Number(cacheCONFIG.btc_minvalue).toFixed(2) + ' ' + cacheCONFIG.fiat + '</td></tr>\n';
					html += '</table>\n';
					document.getElementById('divStatusBTC').innerHTML = html;			// update the div
				}


				if ( (typeof data.node.btcln != 'undefined') && (typeof data.node.btcln.status == 'object') ){
					var html;
					cacheNODE.btcln.status = data.node.btcln.status;
		
					html = '<table>\n';

					if (typeof data.node.btcln.status.version != 'undefined') {
						html += '<tr><th>Version</th><td align="right">' + data.node.btcln.status.version + '</td></tr>\n';
						html += '<tr><th>Blocks</th><td align="right">' + data.node.btcln.status.blocks + '</td></tr>\n';
						html += '<tr><th>Connections</th><td align="right">' + data.node.btcln.status.connections + '</td></tr>\n';
					}
					else {
						html += '<tr><th>Connections</th><td align="right">No Channels</td></tr>\n';
					}


					if (cacheCONFIG.btcln_allow == 1) { 
						html += '<tr><th>Lightning Payments</th><td align="right">Enabled</td></tr>\n'; 
					}
					else {
						html += '<tr><th>Lightning Payments</th><td align="right">Disabled</td></tr>\n'; 
					}

					html += '<tr><th>Min Order Value</th><td align="right">' + Number(cacheCONFIG.btcln_minvalue).toFixed(2) + ' ' + cacheCONFIG.fiat + '</td></tr>\n';
					html += '<tr><th valign=\"top\">Max Order Value</th><td align="right">' + Number( (data.node.btcln.status.channel_max / 100000000) * cacheEXCH.BTC).toFixed(2) + ' ' + cacheCONFIG.fiat + '</td></tr>\n';
					html += '</table>\n';
					document.getElementById('divStatusBTCLN').innerHTML = html;			// update the div
				}
			}
			
			// *************************************************************************************************************************************
			if (typeof data.notify != 'undefined') {						// user notification event

				if (data.notify.message > 0) {								// new message
					if ((cacheNOTIFY.message > 0) && (data.notify.message > cacheNOTIFY.message) && (cacheUSER.privilege > 0) ) {	
						console.log('jsonCOMMAND() : beep! new message');
						var audio = new Audio('audio/notify.mp3');				// play sound
						audio.play();
						if (cacheDISPLAY.divname != 'Messages') {				// show alert button if we're on a different div
							document.getElementById('divTitleAlert').innerHTML = '<img src=\"images/bell.png\" onclick=\"B_alert(\'message\');\" title=\"New Message\">';
						}
					}
					cacheNOTIFY.message = data.notify.message;					// cache timestamp
				}

				if (data.notify.orders > 0) {								// new order
					if ((cacheNOTIFY.orders > 0) && (data.notify.orders > cacheNOTIFY.orders) ) {
						console.log('jsonCOMMAND() : beep! new order');
						var audio = new Audio('audio/notify.mp3');				// play sound (plays for notification AND confirmations)
						audio.play();
						if ( (cacheDISPLAY.divname != 'Orders') && (cacheDISPLAY.divname != 'Order') ) {	// not showing orders div, show the button
							document.getElementById('divTitleAlert').innerHTML = '<img src=\"images/bell.png\" onclick=\"B_alert(\'orders\');\" title=\"Order Update\">';
						}		
						else {											// showing orders div, clear the button
							document.getElementById('divTitleAlert').innerHTML = '';
						}

					}
					cacheNOTIFY.orders = data.notify.orders;					// cache timestamp
				}

				if (data.notify.users > 0) {								// new user login
					if ( (cacheNOTIFY.users > 0) && (data.notify.users > cacheNOTIFY.users) && (cacheUSER.privilege > 0)  ) {
						console.log('jsonCOMMAND() : beep! user login');
						var audio = new Audio('audio/notify.mp3');				// play sound
						audio.play();
						if (cacheDISPLAY.divname != 'Users') {					// show alert button if we're on a different div
							document.getElementById('divTitleAlert').innerHTML = '<img src=\"images/bell.png\" onclick=\"B_alert(\'users\');\" title=\"User Login\">';
						}
					}
					cacheNOTIFY.users = data.notify.users;					// cache timestamp
				}
			}
		
	
	
			// *************************************************************************************************************************************
			if (data.error == 'down') {								// no connection to shopd
				console.log('jsonCOMMAND() : no connection to shopd!');
				// TODO: Show error page
			}
			
			// *************************************************************************************************************************************
			if (typeof data.exch != 'undefined') {							// update exchange rates
				cacheEXCH = data.exch;
				calculate_exch();									// recalculate displayed prices

				exchRATE[0] = cacheEXCH.ZEC.toFixed(2);
				exchRATE[1] = cacheEXCH.YEC.toFixed(2);
				exchRATE[2] = cacheEXCH.BTC.toFixed(2);

				document.getElementById('E_checkoutRIGHT').innerHTML = exchRATE[cacheDISPLAY.exchCOIN] + ' ' + exchCOIN[cacheDISPLAY.exchCOIN] + cacheEXCH.fiat;
			}
		}

	})
	.fail(function(jqXHR, textStatus) {
		console.log('jsonCOMMAND() : failed ! : ' + textStatus);
		// TODO: Show error page
	});
}

// FUNCTIONS RELATED TO DIVS
//
// ******************************************************************************************************************************************************************
function D_showdiv(divname) {											// Show selected div

	if (divname != cacheDISPLAY.divname) {										// only do this if a new div has been selected, avoids flicker
		console.log('D_showdiv() : ' + divname);

		cacheDISPLAY.divname = divname;										// cache divname
															// div names
		var divList = new Array('divLogin', 'divError', 'divCheckout', 'divWallet', 'divAbout', 'divUsers', 'divOrders', 'divOrder', 'divStatus', 'divView', 'divMessages', 'divSplash');
															// titles for each div
		var divTitle = new Array('Login', 'Technical Problem', 'Checkout', 'Shop Wallet', 'About', 'Active Users', 'My Orders', 'Order Status', 'Server Status', 'All Orders', 'Messages', 'Loading');
	
		for (var i = 0; i < divList.length; i++) {								// hide all divs
			document.getElementById(divList[i]).style.display = 'none';
		}
	
		for (var i = 0; i < divList.length; i++) {								// show selected div
			if (divList[i].localeCompare('div' + divname) == 0) {				
				document.getElementById('div' + divname).style.display = 'block';
				if (i == 0) {
					document.getElementById('divTitleText').innerHTML = cacheCONFIG.shopname;
				}
				else {
					document.getElementById('divTitleText').innerHTML = divTitle[i];
				}
			}
		}
	
		if (cacheUSER.privilege == 0 || typeof cacheUSER.privilege == 'undefined') {			// show login menu option if user is logged out
			document.getElementById('divMenuLogout').style.display = 'none';
			document.getElementById('divMenuLogin').style.display = 'block';
		}
		else {												// show logout menu option if user is logged in 
			document.getElementById('divMenuLogout').style.display = 'block';
			document.getElementById('divMenuLogin').style.display = 'none';
		}

		document.getElementById('divMenu').style.display = 'none';					// hide menu
		cacheDISPLAY.menu = 0;
	}

	calculate_exch();											// recalculate displayed prices
}

// ******************************************************************************************************************************************************************
function D_checkout_coin() {										// Update coin images on checkout to enabled/disabled based on config and order value

	var coinList = new Array('ZECT', 'ZECZ', 'BTC', 'BTCLN', 'YECS', 'YECY', 'CASH');			// supported coins
	var conftime;

	for( var coin = 0; coin < coinList.length; coin++) {			
		if( isNaN(cacheCALC.inputstring) ) {								// checkout is not a valid number, so do nothing 
		}
		else {
			if ( coinList[coin] == 'CASH' )	{							// Zcash Transparent
				if (cacheCALC.inputstring > 0) {						// disable
					if (cacheCOIN.CASH != 'enabled') {
						document.getElementById('E_Checkout_Coin_CASH').innerHTML = '<img src=\"images/cash-80x80.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'CASH\');\">';
						cacheCOIN.CASH = 'enabled';
					}
				}
				else {
					if (cacheCOIN.CASH != 'disabled') {
						document.getElementById('E_Checkout_Coin_CASH').innerHTML = '<img src=\"images/cash-80x80-disabled.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'CASH\');\">';
						cacheCOIN.CASH = 'disabled';
					}
				}

			}

			else if ( coinList[coin] == 'ZECT' )	{							// Zcash Transparent
				if (cacheCALC.inputstring > Number(cacheCONFIG.zec_minvalue)) {					// enable
					if (cacheCALC.inputstring < Number(cacheCONFIG.zec_zeroconf)) {			// 0-conf allowed (rabbit)
						if (cacheCOIN.ZECT != 'rabbit') {
							document.getElementById('E_Checkout_Coin_ZECT').innerHTML = '<img src=\"images/zect-80x80-rabbit.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'ZECT\');\">';
							cacheCOIN.ZECT = 'rabbit';
						}
					}
					else {										// confirmation required
						conftime = (cacheCONFIG.zec_minconf * cacheCONFIG.zec_blocktime);
						if (conftime < 180) {							// less than three minutes (turtle)
							if (cacheCOIN.ZECT != 'turtle') {
								document.getElementById('E_Checkout_Coin_ZECT').innerHTML = '<img src=\"images/zect-80x80-turtle.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'ZECT\');\">';
								cacheCOIN.ZECT = 'turtle';
							}
						}
						else {									// more than three minutes (snail)
							if (cacheCOIN.ZECT != 'snail') {
								document.getElementById('E_Checkout_Coin_ZECT').innerHTML = '<img src=\"images/zect-80x80-snail.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'ZECT\');\">';
								cacheCOIN.ZECT = 'snail';
							}
						}
					}
				}
				else {											// disable
					if (cacheCOIN.ZECT != 'disabled') {
						document.getElementById('E_Checkout_Coin_ZECT').innerHTML = '<img src=\"images/zect-80x80-disabled.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'ZECT\');\">';
						cacheCOIN.ZECT = 'disabled';
					}
				}
			}

			else if ( coinList[coin] == 'ZECZ' )	{							// Zcash Shielded
				if (cacheCALC.inputstring > Number(cacheCONFIG.zec_minvalue)) {					// enable
					if (cacheCALC.inputstring < Number(cacheCONFIG.zec_zeroconf)) {			// 0-conf allowed (rabbit)
						if (cacheCOIN.ZECZ != 'rabbit') {
							document.getElementById('E_Checkout_Coin_ZECZ').innerHTML = '<img src=\"images/zecz-80x80-rabbit.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'ZECZ\');\">';
							cacheCOIN.ZECZ = 'rabbit';
						}
					}
					else {										// confirmation required
						conftime = (cacheCONFIG.zec_minconf * cacheCONFIG.zec_blocktime);
						if (conftime < 180) {							// less than three minutes (turtle)
							if (cacheCOIN.ZECZ != 'turtle') {
								document.getElementById('E_Checkout_Coin_ZECZ').innerHTML = '<img src=\"images/zecz-80x80-turtle.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'ZECZ\');\">';
								cacheCOIN.ZECZ = 'turtle';
							}	
						}
						else {									// more than three minutes (snail)
							if (cacheCOIN.ZECZ != 'snail') {
								document.getElementById('E_Checkout_Coin_ZECZ').innerHTML = '<img src=\"images/zecz-80x80-snail.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'ZECZ\');\">';
								cacheCOIN.ZECZ = 'snail';
							}
						}
					}
				}
				else {											// disable
					if (cacheCOIN.ZECZ != 'disabled') {
						document.getElementById('E_Checkout_Coin_ZECZ').innerHTML = '<img src=\"images/zecz-80x80-disabled.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'ZECZ\');\">';
						cacheCOIN.ZECZ = 'disabled';
					}
				}
			}

			else if ( coinList[coin] == 'YECS' )	{							// Ycash Transparent
				if (cacheCALC.inputstring > Number(cacheCONFIG.yec_minvalue)) {					// enable
					if (cacheCALC.inputstring < Number(cacheCONFIG.yec_zeroconf)) {			// 0-conf allowed (rabbit)
						if (cacheCOIN.YECS != 'rabbit') {
							document.getElementById('E_Checkout_Coin_YECS').innerHTML = '<img src=\"images/yecs-80x80-rabbit.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'YECS\');\">';
							cacheCOIN.YECS = 'rabbit'
						}
					}
					else {										// confirmation required
						conftime = (cacheCONFIG.yec_minconf * cacheCONFIG.yec_blocktime);
						if (conftime < 180) {							// less than three minutes (turtle)
							if (cacheCOIN.YECS != 'turtle') {
								document.getElementById('E_Checkout_Coin_YECS').innerHTML = '<img src=\"images/yecs-80x80-turtle.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'YECS\');\">';
								cacheCOIN.YECS = 'turtle';
							}
						}
						else {									// more than three minutes (snail)
							if (cacheCOIN.YECS != 'snail') {
								document.getElementById('E_Checkout_Coin_YECS').innerHTML = '<img src=\"images/yecs-80x80-snail.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'YECS\');\">';
								cacheCOIN.YECS = 'snail';
							}
						}
					}
				}
				else {											// disable
					if (cacheCOIN.YECS != 'disabled') {
						document.getElementById('E_Checkout_Coin_YECS').innerHTML = '<img src=\"images/yecs-80x80-disabled.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'YECS\');\">';
						cacheCOIN.YECS = 'disabled';
					}
				}
			}

			else if ( coinList[coin] == 'YECY' )	{							// Ycash Shielded
				if (cacheCALC.inputstring > Number(cacheCONFIG.yec_minvalue) ) {			// enable
					if (cacheCALC.inputstring < Number(cacheCONFIG.yec_zeroconf)) {			// 0-conf allowed (rabbit)
						if (cacheCOIN.YECY != 'rabbit') {
							document.getElementById('E_Checkout_Coin_YECY').innerHTML = '<img src=\"images/yecy-80x80-rabbit.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'YECY\');\">';
							cacheCOIN.YECY = 'rabbit';
						}
					}
					else {										// confirmation required
						conftime = (cacheCONFIG.yec_minconf * cacheCONFIG.yec_blocktime);
						if (conftime < 180) {							// less than three minutes (turtle)
							if (cacheCOIN.YECY != 'turtle') {
								document.getElementById('E_Checkout_Coin_YECY').innerHTML = '<img src=\"images/yecy-80x80-turtle.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'YECY\');\">';
								cacheCOIN.YECY = 'turtle';
							}
						}
						else {									// more than three minutes (snail)
							if (cacheCOIN.YECY != 'snail') {
								document.getElementById('E_Checkout_Coin_YECY').innerHTML = '<img src=\"images/yecy-80x80-snail.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'YECY\');\">';
								cacheCOIN.YECY = 'snail';
							}
						}
					}
				}
				else {											// disable
					if (cacheCOIN.YECY != 'disabled') {
						document.getElementById('E_Checkout_Coin_YECY').innerHTML = '<img src=\"images/yecy-80x80-disabled.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'YECY\');\">';
						cacheCOIN.YECY = 'disabled';
					}
				}
			}

			else if ( coinList[coin] == 'BTC' )	{							// Bitcoin Onchain
				if (cacheCALC.inputstring > Number(cacheCONFIG.btc_minvalue)) {					// enable
					if (cacheCALC.inputstring < Number(cacheCONFIG.btc_zeroconf)) {			// 0-conf allowed (rabbit)
						if (cacheCOIN.BTC != 'rabbit') {
							document.getElementById('E_Checkout_Coin_BTC').innerHTML = '<img src=\"images/btc-80x80-rabbit.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'BTC\');\">';
							cacheCOIN.BTC = 'rabbit';
						}
					}
					else {										// confirmation required
						conftime = (cacheCONFIG.btc_minconf * cacheCONFIG.btc_blocktime);
						if (conftime < 180) {							// less than three minutes (turtle)
							if (cacheCOIN.BTC != 'turtle') {
								document.getElementById('E_Checkout_Coin_BTC').innerHTML = '<img src=\"images/btc-80x80-turtle.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'BTC\');\">';
								cacheCOIN.BTC = 'turtle';
							}
						}
						else {									// more than three minutes (snail)
							if (cacheCOIN.BTC != 'snail') {
								document.getElementById('E_Checkout_Coin_BTC').innerHTML = '<img src=\"images/btc-80x80-snail.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'BTC\');\">';
								cacheCOIN.BTC = 'snail';
							}
						}
					}
				}
				else {											// disable
					if (cacheCOIN.BTC != 'disabled') {
						document.getElementById('E_Checkout_Coin_BTC').innerHTML = '<img src=\"images/btc-80x80-disabled.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'BTC\');\">';
						cacheCOIN.BTC = 'disabled';
					}
				}
			}

			else if ( coinList[coin] == 'BTCLN' )	{						// Bitcoin Lightning
				if ( (cacheCALC.inputstring > Number(cacheCONFIG.btcln_minvalue)) && (cacheCALC.inputstring <= ((cacheCONFIG.btcln_maxvalue / 100000000) * cacheEXCH.BTC)) ){	
					if (cacheCOIN.BTCLN != 'rabbit') {
						document.getElementById('E_Checkout_Coin_BTCLN').innerHTML = '<img src=\"images/btcln-80x80-rabbit.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'BTCLN\');\">';
						cacheCOIN.BTCLN = 'rabbit';
					}
				}
				else {											// disable
					if (cacheCOIN.BTCLN != 'disabled') {
						document.getElementById('E_Checkout_Coin_BTCLN').innerHTML = '<img src=\"images/btcln-80x80-disabled.png\" width=\"80\" height=\"80\" onclick=\"B_checkout(\'BTCLN\');\">';
						cacheCOIN.BTCLN = 'disabled';
					}
				}
			}
		}
	}

//	cacheCONFIG.zec_zeroconf;	// if value greater (turtle), if less (rabbit)
//	cacheCONFIG.btc_zeroconf;	// if value less (turtle), if greater (snail)
//	cacheCONFIG.btcln		// always (rabbit) if enabled

}

// ******************************************************************************************************************************************************************
function D_onresize() {											// event handler for window resize

//	if ( window.innerHeight < window.innerWidth ) {
//		console.log('Landscape...');
//	}
//	else {
//		console.log('Portrait...');
//	}

	if (window.innerHeight < 440) {										// too short for sprites
		document.getElementById('canvasLoginContainer').style.display = 'none';
	}
	else {													// tall enough for sprites
		document.getElementById('canvasLoginContainer').style.display = 'block';
	}




}


// ******************************************************************************************************************************************************************
function getPos(el) {												// get position of a page element
	for (var lx =0, ly = 0; el != null;
		lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
		return { x: lx, y: ly};
}


// FUNCTIONS TRIGGERED BY TIMERS
//
// ******************************************************************************************************************************************************************
function T_update() {											// timed events/updates

	timerCONFIG.ticks++;											// increment tick counter
	timerCONFIG.seconds = timerCONFIG.ticks / (1000/timerCONFIG.ticktime);					// seconds elapsed since last reset

	if (timerCONFIG.minutes >= timerCONFIG.minutes_reset) {							// check minute counter
		timerCONFIG.minutes = 0;
	}

	if (timerCONFIG.seconds >= timerCONFIG.seconds_reset) {							// check seconds counter
		timerCONFIG.seconds = 0;						
		timerCONFIG.ticks = 0;
		timerCONFIG.minutes += (timerCONFIG.seconds_reset / 60);

		jsonCOMMAND( { req:'config_get' } );								// reload shop config, just in case its been updated

														// updates available to LOGGED OUT users
		if (cacheDISPLAY.divname == 'View') {									// list all active orders
			jsonCOMMAND( { req:'order_list' } );				
		}

		if (cacheUSER.privilege > 0) {									// these updates are only for LOGGED IN users

			cacheDISPLAY.exchCOIN++;									// cycle coin exch rate on checkout
			if (cacheDISPLAY.exchCOIN >= exchCOIN.length) {
				cacheDISPLAY.exchCOIN = 0;
			}

			jsonCOMMAND({ req:'mesg_inbox' });								// check for messages

			if (cacheDISPLAY.divname == 'Users') {								// update active user 
				jsonCOMMAND({ req:'user_list' });			
			}

			if (cacheDISPLAY.divname == 'Orders') {								// list users orders
				jsonCOMMAND( { req:'order_user' } );				
			}
			if (cacheDISPLAY.divname == 'Status') {								// update node status
				jsonCOMMAND( { req:'status_get' } );				
			}
			if (typeof cacheORDER.ordernumber != 'undefined') {						// update active order status
				jsonCOMMAND( { req:'order_get', ordernumber: cacheORDER.ordernumber } );				
			}
		}
	}

	if (cacheDISPLAY.divname == 'Login') {									// animate login sprite
		divLoginSprite.update();		
		divLoginSprite.render();						
	}

	if (cacheDISPLAY.divname == 'Error') {									// animate error sprite
		divErrorSprite.update();	
		divErrorSprite.render();
	}
}


// FUNCTIONS FOR COOKIES
//
// ******************************************************************************************************************************************************************
function setCookie(cname, cvalue, exdays) {									// set a cookie

	var d = new Date();											// new date object
	d.setTime(d.getTime() + (exdays*24*60*60*1000));							// set to current datetime + expiry time
	var expires = 'expires=' + d.toUTCString();					
	document.cookie = cname + '=' + cvalue + '; ' + expires + '; path=/';					// set cookie
}


// ******************************************************************************************************************************************************************
function getCookie(cname) {											// get a cookie

	var name = cname + "=";
	var ca = document.cookie.split(';');

	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {									// got the cookie 
			return c.substring(name.length, c.length);
		}
	}
	return "";												// nope, cookie wasnt there
}

// ******************************************************************************************************************************************************************
function user_logout(message) {											// logout the user, toss cookie, switch to login div

	document.getElementById('divMenuLogout').style.display = 'none';					// hide logout menu
	document.getElementById('divMenuLogin').style.display = 'none';						// show login menu
	document.getElementById('divLoginMessage').innerHTML = message;
	document.getElementById('E_login_username').value = '';							// clear login credentials
	document.getElementById('E_login_password').value = '';
	document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00:01 GMT;';			// toss the cookie
	cacheUSER.privilege = 0;										// change user privilege to logged out
	D_showdiv('Login');											// go to checkout
	timerCONFIG.seconds_reset = timerCONFIG.slow;								// switch to slow updates
}


// FUNCTIONS FOR CONVERSION & FORMATTING
//
// ******************************************************************************************************************************************************************
function getDatetime(unixtime) {										// convert unix timestamp to a string

	var a = new Date(unixtime * 1000);
	var time = a.getFullYear() + '-' + zeroPad((a.getMonth() + 1),2) + '-' + zeroPad(a.getDate(),2) + ' ' + zeroPad(a.getHours(),2) + ':' + zeroPad(a.getMinutes(),2);
	return(time);
}

// ******************************************************************************************************************************************************************
//
function zeroPad(num, places) {											// convert number to zero padded string
	var zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}

// ******************************************************************************************************************************************************************
//
function truncate(str, length) {										// truncate string to a given length

	if (length == null) {
		length = 20;
	}
	if (str.length > length) {
		return str.substring(0, length);
	}
	else {
		return str;
	}
}

// ******************************************************************************************************************************************************************
//
function unixtime() {												// return current time as unixtime

	var now = Math.round((new Date()).getTime() / 1000);					
	return(now);
}

// ******************************************************************************************************************************************************************
//
function remove_non_ascii(str) {										// remove non ascii chars from a string

	var tmpstr = str.replace(/(\r\n|\n|\r)/gm,'<br>');
	return (tmpstr.replace(/[^ -~]/g, '')); 									// works, sort of, but its lossy
}

// FUNCTIONS FOR MOUSE POSITION
//
// ******************************************************************************************************************************************************************
function onMouseMove(event) {							// event handler for mouse movement - draws the dog eyeballs

	event = event || window.event;

	var lookatX = event.pageX;						// position of the mouse in the window
	var lookatY = event.pageY;

	var lookfrom = getPos(document.getElementById("canvasLogin"));	// get position of divLoginSprite canvas

	divLoginCONFIG.eye.right.pos.X = (0 - (lookfrom.x - lookatX + divLoginCONFIG.eye.right.center.X) * 8) / 150;	// right eye
	divLoginCONFIG.eye.right.pos.Y = ((lookatY - lookfrom.y - divLoginCONFIG.eye.right.center.Y) * 8) / 150;

	if (divLoginCONFIG.eye.right.pos.X > divLoginCONFIG.eye.right.max.X) { divLoginCONFIG.eye.right.pos.X = divLoginCONFIG.eye.right.max.X; }
	if (divLoginCONFIG.eye.right.pos.X < divLoginCONFIG.eye.right.min.X) { divLoginCONFIG.eye.right.pos.X = divLoginCONFIG.eye.right.min.X; }
	if (divLoginCONFIG.eye.right.pos.Y > divLoginCONFIG.eye.right.max.Y) { divLoginCONFIG.eye.right.pos.Y = divLoginCONFIG.eye.right.max.Y; }
	if (divLoginCONFIG.eye.right.pos.Y < divLoginCONFIG.eye.right.min.Y) { divLoginCONFIG.eye.right.pos.Y = divLoginCONFIG.eye.right.min.Y; }

	divLoginCONFIG.eye.left.pos.X = (0 - (lookfrom.x - lookatX + divLoginCONFIG.eye.left.center.X) * 8) / 150;	// left eye
	divLoginCONFIG.eye.left.pos.Y = ((lookatY - lookfrom.y - divLoginCONFIG.eye.left.center.Y) * 8) / 150;

	if (divLoginCONFIG.eye.left.pos.X > divLoginCONFIG.eye.left.max.X) { divLoginCONFIG.eye.left.pos.X = divLoginCONFIG.eye.left.max.X; }
	if (divLoginCONFIG.eye.left.pos.X < divLoginCONFIG.eye.left.min.X) { divLoginCONFIG.eye.left.pos.X = divLoginCONFIG.eye.left.min.X; }
	if (divLoginCONFIG.eye.left.pos.Y > divLoginCONFIG.eye.left.max.Y) { divLoginCONFIG.eye.left.pos.Y = divLoginCONFIG.eye.left.max.Y; }
	if (divLoginCONFIG.eye.left.pos.Y < divLoginCONFIG.eye.left.min.Y) { divLoginCONFIG.eye.left.pos.Y = divLoginCONFIG.eye.left.min.Y; }


	lookfrom = getPos(document.getElementById("canvasError"));		// get position of divErrorSprite canvas

	divErrorCONFIG.eye.right.pos.X = (0 - (lookfrom.x - lookatX + divErrorCONFIG.eye.right.center.X) * 8) / 150;	// right eye
	divErrorCONFIG.eye.right.pos.Y = ((lookatY - lookfrom.y - divErrorCONFIG.eye.right.center.Y) * 8) / 150;

	if (divErrorCONFIG.eye.right.pos.X > divErrorCONFIG.eye.right.max.X) { divErrorCONFIG.eye.right.pos.X = divErrorCONFIG.eye.right.max.X; }
	if (divErrorCONFIG.eye.right.pos.X < divErrorCONFIG.eye.right.min.X) { divErrorCONFIG.eye.right.pos.X = divErrorCONFIG.eye.right.min.X; }
	if (divErrorCONFIG.eye.right.pos.Y > divErrorCONFIG.eye.right.max.Y) { divErrorCONFIG.eye.right.pos.Y = divErrorCONFIG.eye.right.max.Y; }
	if (divErrorCONFIG.eye.right.pos.Y < divErrorCONFIG.eye.right.min.Y) { divErrorCONFIG.eye.right.pos.Y = divErrorCONFIG.eye.right.min.Y; }

	divErrorCONFIG.eye.left.pos.X = (0 - (lookfrom.x - lookatX + divErrorCONFIG.eye.left.center.X) * 8) / 150;	// left eye
	divErrorCONFIG.eye.left.pos.Y = ((lookatY - lookfrom.y - divErrorCONFIG.eye.left.center.Y) * 8) / 150;

	if (divErrorCONFIG.eye.left.pos.X > divErrorCONFIG.eye.left.max.X) { divErrorCONFIG.eye.left.pos.X = divErrorCONFIG.eye.left.max.X; }
	if (divErrorCONFIG.eye.left.pos.X < divErrorCONFIG.eye.left.min.X) { divErrorCONFIG.eye.left.pos.X = divErrorCONFIG.eye.left.min.X; }
	if (divErrorCONFIG.eye.left.pos.Y > divErrorCONFIG.eye.left.max.Y) { divErrorCONFIG.eye.left.pos.Y = divErrorCONFIG.eye.left.max.Y; }
	if (divErrorCONFIG.eye.left.pos.Y < divErrorCONFIG.eye.left.min.Y) { divErrorCONFIG.eye.left.pos.Y = divErrorCONFIG.eye.left.min.Y; }

	divLoginSprite.render();							// redraw sprites
	divErrorSprite.render();			
}


// FUNCTIONS FOR SPRITES 
//
// ******************************************************************************************************************************************************************
function sprite (options) {

	var that = {}, frameIndex = 0, tickCount = 0, ticksPerFrame = options.ticksPerFrams || 0, numberOfFrames = options.numberOfFrames || 1;

	that.context = options.context;
	that.width = options.width;
	that.height = options.height;
	that.image = options.image;

	that.update = function () {
		tickCount += 1;
		if (tickCount > ticksPerFrame) {
			tickCount = 0;

			if (frameIndex < numberOfFrames - 1) {
				frameIndex += 1;
			} else {
				frameIndex = 0;
			}
		}
	};

	that.render = function () {						// draw the sprite
		that.context.clearRect(0, 0, that.width, that.height);		// clear canvas
		that.context.drawImage(						// draw next frame
			that.image,
			frameIndex * that.width / numberOfFrames,
			0,
			that.width / numberOfFrames,
			that.height,
			0,
			0,
			that.width / numberOfFrames,
			that.height);	

			spriteEyesDraw('canvasLogin', divLoginCONFIG);		// draw eyeballs
			spriteEyesDraw('canvasError', divErrorCONFIG);		// draw eyeballs
	};
	return that;
}


// -----------------------------------------------------------------------------------------------------------------------------------------------------
// draw sprite eyeballs
//
function spriteEyesDraw(canvasname, config) {

	var canvas = document.getElementById(canvasname);		// get the canvas
	var context = canvas.getContext('2d');
	var fillstyle = '#000000';					// eyeball color
	var size = 4;							// size of eyeballs

	context.beginPath();						// right eye
	context.arc((config.eye.right.center.X + config.eye.right.pos.X), (config.eye.right.center.Y + config.eye.right.pos.Y), size, 0.5, 2* Math.PI, false);
	context.fillStyle = fillstyle;
	context.fill();
		
	context.beginPath();						// left eye
	context.arc((config.eye.left.center.X + config.eye.left.pos.X), (config.eye.left.center.Y + config.eye.left.pos.Y), size, 0.5, 2* Math.PI, false);
	context.fillStyle = fillstyle;
	context.fill();
}



