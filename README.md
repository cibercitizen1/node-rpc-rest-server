# node-rpc-rest-server

Easily  and  automatically  expose  any exported  function  in  module
logic/logic.js  to be  called through  a POST  request.
This is, if `f1()` is in `logic.js` then, it can be called
sending a `POST /f1`.

Logic functions must be
"promisified" JavaScripts functions, so to use async-await.

You should only have to adapt `logic/logic.js` and
configure the server options in `restServer/mainServer.js`

An exposed function in logic receives the request
url params (?k1=v1&k2=v2 ...) and body.

```
module.exports.test = async function( args, payload ) {

	console.log( "L ags=" + args )
	console.log( "L payload=" + payload )

	return 1234
} // ()
```
The service can be used with http or https.

## Login

It is assumed that a `GET /login?user=...&password=,...`
is issued before the rest of (POST) functions may be called.

Therefore, logic.js must also provide
- a `checkLogin()` function

```
module.exports.checkLogin = function( user, password ) {
```

This functions returns a promise. If login is OK, resolve
an object with `payload` to be returned in the reponse body,
and `token` to be returned hidden in a cookie. The client must re-send
this token in subsequent calls to POST functions.
If login fails, reject the promise.

- a `checkTokenIsValid()` function
returning true of false according to the token beeing ok or not.
`checkTokenIsValid()` is called for any incoming POST call.

## Example:

   `restServer/mainServer.js`
   and `logic/logic.js` is
   a functional example on how to use the RPC server.
   It uses https, so read restServer/keys/00_Readme.txt

   `logic/logic.js` shows the use of a sqlite database.

   Read and run restServer/test/mainTest1.js to learn how to
   make client calls to the server from JavaScript.

   Finally, a html page using the server is provided.
   Read htmlServer/public_html/signin/index.html
   to learn how to use it thrhoug ajax calls.

In general, for more instructions read:

- 00_Readme.txt
- restServer/00_Readme.txt
- restServer/keys/00_Readme.txt
- db/00_Readme.txt
