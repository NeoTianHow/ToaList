const { logEvents } = require("./logger");

// If an error occurs, find out the details such as
// ....... origin (where it came from)
const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );

  console.log(err.stack);

  const status = res.statusCode ? res.statusCode : 500; // server error
  res.status(status);

  res.json({ message: err.message, isError: true });
};

module.exports = errorHandler;
