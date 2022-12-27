const { format } = require("date-fns");
const { v4: uuid } = require("uuid");

// This is node.js file system module. It's different from date-fns (third party)
const fs = require("fs");
const fsPromises = require("fs").promises;

const path = require("path");

// An alternative is to use a logging library
// https://blog.appsignal.com/2021/09/01/best-practices-for-logging-in-nodejs.html

// Take a look at this later
const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logInfo = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    const logsPath = path.join(__dirname, "..", "logs");
    // Check if the "logs" directory exist. If not, create it.
    if (!fs.existsSync(logsPath)) {
      await fsPromises.mkdir(logsPath);
    }
    // Add the log info to a file, defined by log file name
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logInfo
    );
  } catch (error) {
    console.log(error);
  }
};

// log every request that comes in (optimise it). user can type and link
const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  console.log(`${req.method} ${req.url}   `);
  next();
};

module.exports = { logEvents, logger };
