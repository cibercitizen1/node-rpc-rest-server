//
// Generate public and private certs.
//

  $ openssl req -addext subjectAltName=DNS:localhost,DNS:127.0.0.1 -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout privateKey.pem -out publicCert.pem

//
// include the field "subjectAltName" to
// let the browser/http-client connect to https://localhost with
// a self-signed certificate.
//

//
// HOWTO import public cert in chromium/chrome:
// - launch chromium con
//
  $ chromium (maybe --disable-web-security flag)
//
// - open chrome://settings/certificates
// In field "Issuing entities" (or something like that)
//   y push "IMPORT" and choose the public cert.
//
