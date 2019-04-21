// -------------------------------------------------------------- 
//
// logic.js
//
// Designed as a "singleton"
//
// -------------------------------------------------------------- 

const sqlite3 = require( "sqlite3" )

// -------------------------------------------------------------- 
// private global vars
// -------------------------------------------------------------- 
var dbConnection = null

// -------------------------------------------------------------- 
// 
// dbName: Text ->
//                     f() .-> dbConnection:Connection
// 0 | error:Text <-
// 
// private
// -------------------------------------------------------------- 
function openDBConnection( dbName ) {
	return new Promise( function( resolve, reject ) {
		dbConnection = new sqlite3.Database(
			dbName,
			( err ) => {
				if( ! err )  {
					dbConnection.run( "PRAGMA foreign_keys = ON" )
					resolve()
				} else {
					reject( err )
					dbConnection = null
				}
			})
	}) // return
} //  ()

// -------------------------------------------------------------- 
// 
//                     f() <-. dbConnection:Connection
// 0 | error:Text <-
// 
// private
// -------------------------------------------------------------- 
function closeDBConnection() {
	return new Promise( (resolve, reject) => {
		if ( dbConnection == null ) {
			resolve()
		} else {
			dbConnection.close( (err)=>{
				( err ? reject(err) : resolve() )
			})
		}
	})
} // ()

// -------------------------------------------------------------- 
//
// constructor() (singleton's)
//
// dbName: Text ->
//                    f() .->
//
// public
// -------------------------------------------------------------- 
module.exports.init = async function( dbName ) {

	console.log( "L init() logic.js" )

	await closeDBConnection()

	return openDBConnection( dbName )
} // ()

// -------------------------------------------------------------- 
//
// user: Text
// password: Text
// -->
//    f()
// <--
// Answer=(load:(user, email, role, ....), token:Text ) | Error
//
// load is sent to the requester in the payload response 
// token is sent as a cookie
// 
// -------------------------------------------------------------- 
module.exports.checkLogin = function( user, password ) {

	console.log( "L  logic.checkLogin() ------------- " )

	// simulated check
	return new Promise( (resolve, reject) => {
		setTimeout (
			function () {
				if ( 2 == 1 + 1 ) { // hard test !
					// return invented data
					resolve( {
						payload: {
							user: user,
							email: "user@example.org",
							role: "big boss"
						},
						token:  JSON.stringify(
							{
								author: "me", 
								comentario: "This is a token set in GET /login",
								user: user,
								password: password,
								role: "big boss"
							})
						})
				} // if
			},
			100)
	}) // return new Promise
} // ()

// -------------------------------------------------------------- 
//
// token: Text -> f() -> Boolean
//
// -------------------------------------------------------------- 
module.exports.checkTokenIsValid = function ( tokenText ) {

	console.log ( "L checkTokenIsValid()" )

	console.log ( "L token to check: " + tokenText )
	//
	// token should have been ciphered before sending it
	// thus, we would deciper it now
	//
	try {
		var theToken = JSON.parse( tokenText )
	} catch ( err ) {
		console.log("L the token appears not to be genuine :-( permission denied")
		return false
	}

	//
	// because this is only a how-to, check something easy
	//
	if ( theToken.author != "me" )  {
		console.log("L the token appears not to be genuine :-( permission denied")
		return false
	}
	
	console.log ("L the token is OK" )
	return true
} // ()


// -------------------------------------------------------------- 
//  
// Test function in the logic
//  
//  To call it:
//  request POST /test?arg1=val1&arg2=val2 + payload
//  
//  args: es arg1=val1&arg2=val2 received as an object
//  palyoad: received as is
//  
// public
// -------------------------------------------------------------- 
module.exports.test = async function( args, payload ) {
	console.log( "\nL  logic.test() ------------- " )

	console.log( "L ags=" + args )
	// console.log( "L " + JSON.parse( payload ) )
	console.log( "L payload=" + payload )

	return 1234
} // ()

// -------------------------------------------------------------- 
//
// id:Text
//         -->
//            findPersonByID() <--
//         <--
// (id:Text, name:Text) | Error
//
// dni is in args
// payload is not used
//
// public
// -------------------------------------------------------------- 
module.exports.findPersonByID = function( args, payload ) {
	console.log( "\nL logic.findPersonByID() ------------- " )
	console.log( "L " + args )

	var sqlText = "select * from User where id=$id";
	var sqlValues = { $id: args.id }
	
	return new Promise( (resolve, reject) => {
		dbConnection.all( sqlText, sqlValues,
							 ( err, res ) => {
								 ( err ? reject(err) : resolve(res) )
							 })
	})
} // ()


// -------------------------------------------------------------- 
// -------------------------------------------------------------- 
// -------------------------------------------------------------- 
// -------------------------------------------------------------- 
