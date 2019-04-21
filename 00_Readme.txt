
1. Launch rpc rest server in 8080:

   $ cd  restServer/

   $ npm start

Read restServer/mainServer.js
Read restServer/keys/00_Readme.txt

Run tests:

  $ npm test

2. Web page using the rest rpc server in htmlServer. Launch html server in 8081:

  $ cd htmlServer

  $ lauchHTTPServer.sh

Read htmlServer/public_html/signin/index.html
It uses ajax   $.get to send  enviar GET /login to
   https://localhost:8080/login (crossDomain: true)
and jQuery.ajax( method: "post" ...)
   to send POST /test to https://localhost:8080/test

3. Open a browser. (Tested with Linux chromium)

   $ chromium (may be with --disable-web-security flag)

Load .pem certificate (annoted with "subjectAltName" including,
read restServer/keys/00_Readme.txt)
throug  chrome://settings/certificates

   - open chromium developer tools 

   - open http://localhost:8081/signin

   Write whatever in e-mail and password ( a@b 1234) and press
   blue button "sign in"
   Then, press greh button "POST /test" 
