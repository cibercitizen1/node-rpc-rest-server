
// --------------------------------------------------------
// mainTest1.js
// --------------------------------------------------------

// --------------------------------------------------------
// --------------------------------------------------------
const assert = require ('assert')

const request = require ('request') 

// --------------------------------------------------------
// --------------------------------------------------------
const SERVER_URL="https://localhost:8080"

// --------------------------------------------------------
// main ()
// --------------------------------------------------------

//
//
//
describe( "Test 1 (login and call some methods)", function() {

	// ....................................................
	//
	// ....................................................
	it( "test GET /login is OK", function( done ){
		request.get ( 
			{
				url: SERVER_URL+"/login?user=alice&password=1234",
				headers: {
					'User-Agent': 'me',
				},
				rejectUnauthorized: false // accept self-signed certs
			},
			// response callback
			function (err, response, body) {

				assert.equal( err, null, "¿error is not null? " + err )
				assert.equal( response.statusCode, 200,
							  "¿code is not 200?" + response.statusCode )

				console.log (" ----- GET /login response ---- ")
				console.log ("       body = " + body)
				console.log (" -------------------------------- ")

				var userData = JSON.parse( body )

				assert.equal( userData.user, "alice" )

				//
				// Save the cookie received now, to re-send it
				// in future requests.
				// 
				// It has the opaque token.
				// Without it, such calls will fail.
				//
				theCookie = response.headers["set-cookie"][0]

				// console.log( theCookie )

				//
				//
				//
				done ()
			}
		) // 
	}) // it

	// ....................................................
	//
	// ....................................................
	it( "test /test)", function( done ){
		request.post ( 
			{
				url: SERVER_URL+"/test?value1=1234",
				headers: {
					'User-Agent': 'me',
					'Cookie': theCookie
				},
				rejectUnauthorized: false, // accept self-signed certs
				body: JSON.stringify( {a: 1, b:2} )
			},
			// response callback
			function (err, response, body) {

				assert.equal( err, null, "¿error is not null? " + err )
				assert.equal( response.statusCode, 200,
							  "¿code is not 200?" + response.statusCode )

				console.log ("\t\t ----- POST /test response ---- ")
				console.log ("\t\t       body = " + body)
				console.log ("\t\t -------------------------------- ")

				done ()
			}
		) // get
	}) // it

	// ....................................................
	//
	// ....................................................
	it( "testest findPersonByID", function( done ){
		request.post ( // peticion: POST
			{
				url: SERVER_URL+"/findPersonByID?id=1234A",
				headers: {
					'User-Agent': 'me',
					'Cookie': theCookie
				},
				// aceptar certificados auto-firmados
				rejectUnauthorized: false,
			},
			// response callback
			function (err, response, body) {

				assert.equal( err, null, "¿error is not null? " + err )
				assert.equal( response.statusCode, 200,
							  "¿code is not 200?" + response.statusCode )

				console.log ("\t\t ----- POST  /findPersonBYID reponse ---- ")
				console.log ("\t\t       body = " + body)
				console.log ("\t\t -------------------------------- ")

				done ()
			}
		) // get
	}) // it

}) // describe 

