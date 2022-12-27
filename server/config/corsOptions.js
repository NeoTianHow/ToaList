// CORS is a HTTP-header mechanism used to indicate
// which domain(s) can have access to our API/server
// Origin: https://foo.example

const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    // Check if the origin of the request is in the list of allowed origins
    // or it is not set and empty, which indicates that it is not requested
    // by a web browser but rather from tools such as Postman
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
