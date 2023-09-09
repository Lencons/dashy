/**
 * This file contains the Node.js code, used for the optional status check feature
 * It accepts a single url parameter, and will make an empty GET request to that
 * endpoint, and then resolve the response status code, time taken, and short message
 */
const axios = require('axios').default;
const https = require('https');

/* Determines if successful from the HTTP response code */
const getResponseType = (code, validCodes) => {
  if (validCodes && String(validCodes).includes(String(code))) return true;
  if (Number.isNaN(code)) return false;
  const numericCode = parseInt(code, 10);
  return (numericCode >= 200 && numericCode <= 302);
};

/* Makes human-readable response text for successful check */
const makeMessageText = (data) => `${data.successStatus ? '✅' : '⚠️'} `
  + `${data.serverName || 'Server'} responded with `
  + `${data.statusCode} - ${data.statusText}. `
  + `\n⏱️Took ${data.timeTaken} ms`;

/* Makes human-readable response text for failed check */
const makeErrorMessage = (data) => `❌ Service Unavailable: ${data.hostname || 'Server'} `
  + `resulted in ${data.code || 'a fatal error'} ${data.errno ? `(${data.errno})` : ''}`;

const makeErrorMessage2 = (data) => '❌ Service Error - '
  + `${data.status} - ${data.statusText}`;

const CA = "\
-----BEGIN CERTIFICATE-----\
MIIErzCCAxegAwIBAgIBATANBgkqhkiG9w0BAQsFADBCMSAwHgYDVQQKDBdMRU5O\
T1hDT05TVUxUSU5HLkNPTS5BVTEeMBwGA1UEAwwVQ2VydGlmaWNhdGUgQXV0aG9y\
aXR5MB4XDTIxMDcxOTEwMjYwMFoXDTQxMDcxOTEwMjYwMFowQjEgMB4GA1UECgwX\
TEVOTk9YQ09OU1VMVElORy5DT00uQVUxHjAcBgNVBAMMFUNlcnRpZmljYXRlIEF1\
dGhvcml0eTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBALZ5ZJci3Dcf\
7JV4ln1RPX1XB4Jz8EwxvaDFUVMOuEEeLD5FCU2tpBK99B3cQnt6ZEn5VkMaa+zK\
P2YnIxp7jmRaDudiq7oX5LBXNhypw84wfJTjk2W6bBrdyJx9GCs8Ii2cGX/IDIh5\
1ARp1N0VRaxIE/ooJXuB9zl+8I6DXB6wLLQokD0mCXAMb8ALVFqEL6hc+3EOPdIC\
jbouGHZlK/pyCThKe16VfBRiysNwaqJaBLUJtR5PBLVWM4aa6J0AO2aJt5hLqcGu\
zX69iqIuRt9pR2u6M6VRwBj50XVaFwxYf5cg8qlsGIUIb24kfzy2Oj+84fLuBmH1\
2E2KX86HCpfqgc8qzitn39spuz6BBeldDwglGnORd+rOHYrU0IhcGjU1zgN4jAnk\
fVCjJ3hD7jC5BbLgY1kGD51l4WvoTlyNgxabLRq6JguIYs/J1NIuYf1X6zI21Q3V\
wWXNFpziR5MM0j8/E1hVsr0HcPV4plCjCKeXcP9locnQ0pmMtDnH1wIDAQABo4Gv\
MIGsMB8GA1UdIwQYMBaAFDEKkwYTZEDHyMK6jv9Bl/B/UT5RMA8GA1UdEwEB/wQF\
MAMBAf8wDgYDVR0PAQH/BAQDAgHGMB0GA1UdDgQWBBQxCpMGE2RAx8jCuo7/QZfw\
f1E+UTBJBggrBgEFBQcBAQQ9MDswOQYIKwYBBQUHMAGGLWh0dHA6Ly9pcGEtY2Eu\
bGVubm94Y29uc3VsdGluZy5jb20uYXUvY2Evb2NzcDANBgkqhkiG9w0BAQsFAAOC\
AYEAeQ9HRxbA0Usen46utV1bmEEAcHrlg0x4R8sPIfHY9X0PMGd8l9ukobc7Wdj/\
60rMmbnNp0NePfnDNJFCkOoCfhPk4XFsAdHnxMGUuxbxrFvA2prdhv58BTcJh8xG\
+IWgOv9svw7VZUrihRIosIoG/cTyxFlGuxCAThqkNdV7mOwNbkNFWO2zt37lwWVD\
leoW5zNPZfJDIvPANZsukygNPbOwCjA3zvOi9OUDB0g3ZHNgVuksN3W7YF/SjqnB\
dfwy0M/X53DVF+5gEv1P+6SEqFWqqNtRfrRwiUKUD2kb3cwyoawOCaRgBdeWWgcQ\
Zrql6+sxG71ZrLAP8c2mCcw/+dw+gJ/qZEuMYXONdmraeYCVB8YLKlZ5HjWig45m\
f3Gi/6qZYxX/d/1BX1cmZFG0CychEhoP/3UY4WKX8AhIq/gCE/IgPdQZmcoug6ks\
YhoekjRiO5ZNG4e2jyF6L6407PmErlwJ5ubFl/SODkKR/mvEIZ6j9fN2v70rvc/x\
AyTb\
-----END CERTIFICATE-----"
/* Kicks of a HTTP request, then formats and renders results */
const makeRequest = (url, options, render) => {
  const {
    headers, enableInsecure, acceptCodes, maxRedirects,
  } = options;
  const validCodes = acceptCodes && acceptCodes !== 'null' ? acceptCodes : null;
  const startTime = new Date();
  const requestMaker = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: !enableInsecure,
      ca: CA,
    }),
  });
  requestMaker.request({
    url,
    headers,
    maxRedirects,
  })
    .then((response) => {
      const statusCode = response.status;
      const { statusText } = response;
      const successStatus = getResponseType(statusCode, validCodes);
      const serverName = response.request.socket.servername;
      const timeTaken = (new Date() - startTime);
      const results = {
        statusCode, statusText, serverName, successStatus, timeTaken,
      };
      results.message = makeMessageText(results);
      return results;
    })
    .catch((error) => {
      const response = error ? (error.response || {}) : {};
      const returnCode = response.status || response.code;
      if (validCodes && String(validCodes).includes(returnCode)) { // Success overridden by user
        const results = {
          successStatus: getResponseType(returnCode, validCodes),
          statusCode: returnCode,
          statusText: response.statusText,
          timeTaken: (new Date() - startTime),
        };
        results.message = makeMessageText(results);
        return results;
      } else { // Request failed
        return {
          successStatus: false,
          message: error.response ? makeErrorMessage2(error.response) : makeErrorMessage(error),
        };
      }
    }).then((results) => {
      // Request completed (either successfully, or failed) - render results
      render(JSON.stringify(results));
    });
};

const decodeHeaders = (maybeHeaders) => {
  if (!maybeHeaders) return {};
  const decodedHeaders = decodeURIComponent(maybeHeaders);
  let parsedHeaders = {};
  try {
    parsedHeaders = JSON.parse(decodedHeaders);
  } catch (e) { /* Not valid JSON, will just return false */ }
  return parsedHeaders;
};

/* Returned if the URL param is not present or correct */
const immediateError = (render) => {
  render(JSON.stringify({
    successStatus: false,
    message: '❌ Missing or Malformed URL',
  }));
};

/* Main function, will check if a URL present, and call function */
module.exports = (paramStr, render) => {
  if (!paramStr || !paramStr.includes('=')) {
    immediateError(render);
  } else {
    // Prepare the parameters, which are got from the URL
    const params = new URLSearchParams(paramStr);
    const url = decodeURIComponent(params.get('url'));
    const acceptCodes = decodeURIComponent(params.get('acceptCodes'));
    const maxRedirects = decodeURIComponent(params.get('maxRedirects')) || 0;
    const headers = decodeHeaders(params.get('headers'));
    const enableInsecure = !!params.get('enableInsecure');
    if (!url || url === 'undefined') immediateError(render);
    const options = {
      headers, enableInsecure, acceptCodes, maxRedirects,
    };
    makeRequest(url, options, render);
  }
};
