// -------------------------------------------------------------- 
// mainServer.js
// -------------------------------------------------------------- 

const RPCServer = require( "./RPCServer.js" )

const fs = require( "fs" )

// -------------------------------------------------------------- 
// capture ctrl-c to exit
// -------------------------------------------------------------- 
process.on('SIGINT', function() {
	console.log ("+ exiting ")
	process.exit( 0 )
})

// -------------------------------------------------------------- 
//
// main()
//
// -------------------------------------------------------------- 
async function main() {

	try {
		const PORT = ( process.argv[2] ? process.argv[2] : 8080 )

		const LOGIC_FILE = ( process.argv[3]
								? process.argv[3]
								: "../logic/logic.js" )

		const ARG_FOR_LOGIC = ( process.argv[4]
										? process.argv[4]
										: "../bd/data.bd" )
		// 
		// logic file must export
		//   + init()
		//   + user, password -> checkLogin() -> Payload, Token | Error
		//   + Token -> checkTokenIsValid() -> Boolean
		//
		const logic = require( LOGIC_FILE )
		await logic.init( ARG_FOR_LOGIC )

		//
		// create the server
		// must provide an object with
		//  + logic with the function to be called
		//  + sessionConfig
		//  + corsConfig (optional)
		//  + https (optional)
		//
		const server = new RPCServer( {
			logic: logic,
			sessionConfig: {
				secret: "I'm a secret",
				cookie: { maxAge: 1000*60*60*24 }, // 1 day
				resave: true,
				saveUninitialized: true
			},
			corsConfig: { allowOrigin: "http://localhost:8081", allowCredentials: "true"}
			,
			https: { 
				key: fs.readFileSync('keys/privateKey.pem')
				, cert: fs.readFileSync('keys/publicCert.pem')
				, requestCert: false 
			}
		} )
		
		//
		// run the server
		//
		server.listen( PORT, function() {
			console.log( "+ rest server in port " + PORT )
		})
	}
	catch( err ) {
			console.log( "+ error=" + err + " ****** " )
	}
									  
} // ()

// -------------------------------------------------------------- 
// -------------------------------------------------------------- 
main()

// -------------------------------------------------------------- 
// -------------------------------------------------------------- 
// -------------------------------------------------------------- 
// -------------------------------------------------------------- 
