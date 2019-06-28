#!/usr/bin/perl
#
# Copyright (c) 2019 ChileBob
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
# associated documentation files (the "Software"), to deal in the Software without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicence and to permit persons to whom the Software
# is furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in all copies or substantial
# portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
# LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
# 
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITIES,
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

use strict;

my $shopserver = '127.0.0.1';								# IP address of your shop server
my $shopport   = 8998;									# listening port 

#########################################################################################################################
# DONT CHANGE ANYTHING BELOW THIS LINE
#########################################################################################################################

use IO::Socket::INET;									# perl module used to connect to nodeserver
my $json_socket;									# socket used for JSON
$| = 1; 										# auto-flush on network socket

use JSON;										# encode JSON
my $JSON = JSON->new;									# 
$JSON->allow_nonref(1);									# allow non-reference (empty) json responses 

my %json = ();										# where the json data is assembled
my $cgivar;
my %cgivar;

my $json_tx = '';									# JSON data sent to nodeserver
my $json_tx_size = 0;									# actual size of JSON data sent
my %json_rx = ();									# JSON received from nodeserver
my $json_rx = '';									# JSON received from nodeserver
my $client_maxbytes = 10000;								# max bytes read from network socket

use CGI ':cgi-lib';									# retreive CGI 
my $cgi = new CGI;
use CGI::Cookie;									# cookie catcher

foreach ($cgi->param) {
	$json{$_} = $cgi->param($_);
}

my %cookie = fetch CGI::Cookie;
$json{'session'} = 'none';
if (exists $cookie{'session'}) {							# retreive session cookie
	$json{'session'} = $cookie{'session'}->value;
}

$json_socket = new IO::Socket::INET (							# connect to shopserver
	PeerHost => $shopserver,	
	PeerPort => $shopport,
	Proto => 'tcp'
);

if($json_socket) {									# check socket
	$json_tx = encode_json \%json;							# JSON encode request to nodeserver

	$json_tx_size = $json_socket->send($json_tx);					# send request
	$json_socket->recv($json_rx, $client_maxbytes);					# get reply

	print "Content-type: application/json\n\n$json_rx";				# reply to client
	shutdown($json_socket, 1); 							# close socket
}
else {											# failed connection, return error code
	my %json = ();
	$json{'error'} = 'down';
	$json_tx = encode_json \%json;							# JSON encode request to nodeserver
	print "Content-type: application/json\n\n$json_tx";				# reply to client
}

exit;											# ...and, we're done!

