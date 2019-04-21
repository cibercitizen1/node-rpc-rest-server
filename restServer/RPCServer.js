// -------------------------------------------------------------- 
// RPCServer.js
// -------------------------------------------------------------- 

const express = require( 'express' )
const expressSession = require( 'express-session' )
const https = require( 'https' )

// -------------------------------------------------------------- 
// 
// server:ExpressServer -> () -> server:ExpressServer
// 
// -------------------------------------------------------------- 
function setBodyReader( server ) {

	console.log( "+ installing bodyReader " )
	server.use( function(request, res, next) {
		
		request.setEncoding('binary')

		var data = []
		request.on('data', function(chunk) { 
			data.push( Buffer.from( chunk, 'binary' ) )
		})
		
		request.on('end', function() {
			request.body = Buffer.concat( data )
			
			next() // request continues
		})
	})
} //  ()

// -------------------------------------------------------------- 
// 
// responseObj:Respuesta:HTTP
// httpCode:Z
// responseData:(...) -> 
//                                  f()
// responseObj:Respuesta:HTTP <-
// 
// Haciendo uso de  responseObj:RespuestaHTTP envía al cliente
// que hizo la petición el httpCode y la responseData (un objeto JSON)
// 
// -------------------------------------------------------------- 
function replyToClient( responseObj, httpCode, responseData ) {

	responseObj.writeHead( httpCode )

	try {
		console.log( "+ httpCode: " + httpCode + " : res = " + responseData ) 
		responseObj.write( JSON.stringify( responseData ) )
	} catch( err ) { }
	
	responseObj.end()
} // 

// -------------------------------------------------------------- 
// 
// logic: Logic
// server:Express -> f() -> server:Express
// 
// -------------------------------------------------------------- 
function setPOSTRouteToCallLogic( server, logic ) {

	console.log( "+ installing post route to call logic" )
	//
	//
	server.post( "/:functionName", async function( request, response ) {

		console.log ( "+ POST() /" + request.params.functionName )

		//
		// extract function name
		//
		var functionName = request.params.functionName

		//
		// extract url args (?k1=v1&k2=v2)
		//
		var args = request.query

		//
		// extract payload (from body)
		//
		var payload = request.body

		console.log( "+ body received: " + payload )

		try {

			//
			// call function in logic
			//
			var res = await logic[ functionName ] ( args, payload )

			// 
			//  call ok
			// 
			replyToClient( response, 200, res )
				
		} catch( err ) {
			//
			// call failed
			//
			console.log( "+ failed call to : " + functionName + " err : " + err ) 
			replyToClient( response, 409, err )
		}

	})
	
} // ()

// -------------------------------------------------------------- 
// 
// logic: Logic
// server:Express -> f() -> server:Express
// 
// -------------------------------------------------------------- 
function setRouteGetLogin( server, logic ) {

	console.log( "+ installing GET /login ")

	server.get('/login', async function(req, response){

		try {

			console.log( "+ GET /login  " + req.url )
			
			//
			// 
			//
			var user = req.query.user
			var password = req.query.password
			
			//
			//
			//
			var theSession = req.session
			
			console.log ("+ session=" + JSON.stringify(theSession) )
			
			// 
			// check user and password
			// 
			var responseData = await logic.checkLogin( user, password )
			
			// 
			//  ok
			// 
			console.log ("+ LOGIN OK ")
				
			// 
			//  return the token in a cookie
			// 
			theSession.theOpaqueToken = responseData.token
			
			// 
			// return 200 OK and payload within the body
			// 
			replyToClient( response, 200, responseData.payload )

		} catch( err ) {

			// ok == false
			console.log ("+ LOGIN ERROR")
			
			// unauthorized
			replyToClient( response, 401, "")
			
		}

	}) // GET /login
} // ()
	
// -------------------------------------------------------------- 
//
// config: Configuration
// server: ExpressServer -> f() -> server: ExpressServer
//
// -------------------------------------------------------------- 
function setExpressSession( server, config ) {

	console.log("+ isntalling expressSession: " + JSON.stringify( config ) )

	server.use ( expressSession( config ) )
	
} // ()

// -------------------------------------------------------------- 
//
// config:Configuration
// server: ExpressServer -> f() -> server: ExpressServer
//
// -------------------------------------------------------------- 
function setCORS( server, config ) {
	server.use (function(req, res, next) {

		// res.setHeader ('Access-Control-Allow-Origin', "http://localhost:8080")
		// res.setHeader ('Access-Control-Allow-Credentials', "true" ) 

		res.setHeader( 'Access-Control-Allow-Origin', config.allowOrigin )
		res.setHeader( 'Access-Control-Allow-Credentials', config.allowCredentials )
		
		next ()

	})
} // ()

// -------------------------------------------------------------- 
// 
// logic:Logic, server: ExpressServer -> f() -> server: ExpressServer
//
// -------------------------------------------------------------- 
function setCallInterceptorToCheckPermissionss( server, logic ) {

	console.log("+ installing interceptor to check permissions" )

	server.use (function(req, res, next) {

		console.log( "\n+ NEW REQUEST ---- " )
		console.log( "+ method = " + req.method )
		console.log( "+ url    =" + req.url )
		
		// 
		// if this is a GET /login we let it proceed
		// 
		if ( isAGetLoginRequest (req) ) {
			console.log ("+ is a GET /LOGIN ")
			next () // proceed
			return
		}
		
		// 
		// 
		// 
		console.log ("+ not a GET /login request: check permissions ")
		
		if (! checkRequestPermission( req, logic ) ){ 
			console.log( "request without permission" )
			res.writeHead(401)  // unauthorized
			res.end()
			return // end without calling next()
		}
		
		// 
		// 
		// 
		console.log ("+ permissions OK")
		
		next() // proceed
	})
	
} // ()

// -------------------------------------------------------------- 
//
// req:PeticionHTTP -> f() -> Boolean
//
// -------------------------------------------------------------- 
function isAGetLoginRequest( req ) {

 	if (req.path != "/login") {
		return false
	}

	if ( req.method != "GET" ) {
		return false
	}

	return true
} // ()

// -------------------------------------------------------------- 
//
// req:PeticionHTTP -> f() -> Boolean
//
// -------------------------------------------------------------- 
function checkRequestPermission( req, logic ) {

	console.log ( "+ checkRequestPermission()" )

	// 
	// get out the token in the session (set as a cookie)
	// 
	var theSession = req.session

	console.log ( "+ opaque token travelling as a cookie=" + theSession.theOpaqueToken ) 

	//
	//
	//
	return logic.checkTokenIsValid( theSession.theOpaqueToken )

} // ()

// -------------------------------------------------------------- 
//
// RPCServer class
//
// -------------------------------------------------------------- 
module.exports = class RPCServer {

	// -------------------------------------------------------------- 
	// params -> f() .->
	// 
	// see how to call in mainServer.js
	// -------------------------------------------------------------- 
	constructor( params ) {

		// private vars
		this.serverExpress = express()
		this.server = this.serverExpress

		setBodyReader( this.serverExpress )

		if( params.sessionConfig ) {
			setExpressSession( this.serverExpress, params.sessionConfig )
		}

		if( params.corsConfig ) {
			setCORS( this.serverExpress, params.corsConfig )
		}

		if( params.logic ) {
			// in *this* order !
			setCallInterceptorToCheckPermissionss( this.serverExpress, params.logic )
			setRouteGetLogin( this.serverExpress, params.logic )
			setPOSTRouteToCallLogic( this.serverExpress, params.logic )
		}


		// if there is https in params, create a https server
		if( params.https ) {
			this.httpsServer = https.createServer( params.https, this.serverExpress )
			this.server = this.httpsServer
		}
	} // 

	// -------------------------------------------------------------- 
	// -------------------------------------------------------------- 
	listen( port, callback ) {
		this.server.listen( port, callback )
	}
} // class RPCServer

// -------------------------------------------------------------- 
// -------------------------------------------------------------- 
// -------------------------------------------------------------- 
// -------------------------------------------------------------- 
