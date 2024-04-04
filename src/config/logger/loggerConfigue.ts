import winston, { format, http, level } from "winston";
import { NextFunction, Request, Response } from "express";
import path from "path";
const { combine, timestamp, label, printf } = format;
const logDirectory = path.join(__dirname, "./loggerFiles");

const myFormat = printf(
  ({ label, level, message, timestamp, controller, statusCode }) => {
    const formatLogger = `${timestamp} [${statusCode}] [${level}] ${label} [${controller}] Message:${message}`;
    // const formatLogger = `${label} ${timestamp} [${email}] [${level}]  [IP:${ip}] ${method}:${url} controller:[${controller}] Message:${message}`
    return formatLogger;
  }
);

function createLogger(req: any) {
  const email = req.user == undefined ? "No email" : req.user.email;

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  const url = req.originalUrl;
  const method = req.method;
  return winston.createLogger({
    // --------------
    level: "info",
    format: combine(
      // winston.format.colorize(),
      winston.format.json(),
      label({ label: `[${email}] [${ip}] ${method}:${url}` }),
      timestamp(),
      myFormat
    ),

    transports: [
      new winston.transports.Console(),
      // new winston.transports.File({ filename: "warning.log", level: "warn" }),
      // new winston.transports.File({ filename: "error.log", level: "error" }),
      // new winston.transports.File({ filename: "combined.log" }),
      new winston.transports.File({
        filename: path.join(logDirectory, "warning.log"),
        level: "warn",
      }),
      new winston.transports.File({
        filename: path.join(logDirectory, "error.log"),
        level: "error",
      }),
      new winston.transports.File({
        filename: path.join(logDirectory, "combine.log"),
      }),
    ],
  });
}

export default {
  createLogger,
};
