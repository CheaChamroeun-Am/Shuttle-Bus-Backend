import { Request, Response, NextFunction } from "express";
import configureLogger from "../../config/logger/loggerConfigue";
import { error } from "console";

// function loggerInfo(message: string) {
//     console.log("Outside"); // This line will always be executed

//     return function (req: Request, res: Response, next: NextFunction) {
//         console.log("inside"); // This line should be executed when this middleware is reached

//         // Gather the required information
//         const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
//         const url = req.originalUrl;
//         const logger = configureLogger.createLogger();
//         const controllerName = req.method + " " + req.route.path;

//         // Log the information using your logger
//         logger.info(message, { ip: ip, url: url, controller: controllerName });

//         // Continue to the next middleware or route handler
//         next();
//     };
// }

function loggerInfo(
  req: Request,
  controllerName: string,
  statusCode: number,
  message: string
) {
  const logger = configureLogger.createLogger(req);
  return logger.info(message, {
    controller: controllerName,
    statusCode: statusCode,
  });
}
function loggerWarn(
  req: Request,
  controllerName: string,
  statusCode: number,
  message: string
) {
  const logger = configureLogger.createLogger(req);
  return logger.warn(message, {
    controller: controllerName,
    statusCode: statusCode,
  });
}

function loggerError(
  req: Request,
  controllerName: string,
  statusCode: number,
  message: string
) {
  const logger = configureLogger.createLogger(req);
  return logger.error(message, {
    controller: controllerName,
    statusCode: statusCode,
  });
}

export { loggerInfo, loggerWarn, loggerError };
