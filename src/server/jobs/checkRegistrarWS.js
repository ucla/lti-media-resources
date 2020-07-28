const registrar = require('../services/registrar');

// Call VerifyConnectivity to make sure that Registrar connection works.
// To enable debugging of the Registrar API call run:
// DEBUG='registrar:*' node src/server/jobs/checkRegistrarWS.js
(async () => {
  const result = await registrar.call({
    url: '/sis/api/v1/Infrastructure/VerifyConnectivity',
    params: {
      anyText: new Date().toUTCString(),
    },
  });

  console.log(result);
  console.log(`Token used = ${process.env.reg_token}`);
})();
