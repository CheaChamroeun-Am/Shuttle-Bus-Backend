import { NextFunction, Request, Response } from "express";
import { respone } from "../../../src/payload/respone/defaultRespone";
import cancelService from "./cancel.service";
import {
  loggerError,
  loggerInfo,
  loggerWarn,
} from "../../config/logger/customeLogger";
import { CustomError } from "../../handler/customError";

async function getAllCancel(req: Request, res: Response, next: NextFunction) {
  const controllerName = getAllCancel.name;
  try {
    const page = req.query.page as string;
    const limit = req.query.limit as string;
    const patternNumFormat = /^-?\d*\.?\d+$/;
    const isStringOfNumberPage = patternNumFormat.test(page);
    const isStringOfNumberLimit = patternNumFormat.test(limit);
    if (page && !isStringOfNumberPage) {
      throw new CustomError(400, "page must be type string of number");
    }
    if (limit && !isStringOfNumberLimit) {
      throw new CustomError(400, "limit must be type string of number");
    }
    let data;
    if (page && limit) {
      data = await cancelService.getPaginatedAllCancelService(+limit, +page);
      respone(res, data, `Get all Cancel are successfull`, 200);
      return loggerInfo(req, controllerName, 200, "Success");
    } else {
      data = await cancelService.getAllCancelService();
      respone(res, data, `Get all Cancel are successfull`, 200);
      return loggerInfo(req, controllerName, res.statusCode, "Success");
    }
  } catch (error: any) {
    console.log("Error status:", error.statusCode);
    if (error.statusCode === 500) {
      loggerError(req, controllerName, error.statusCode, error);
    } else {
      loggerWarn(req, controllerName, error.statusCode, error);
    }
    next(error);
  }
}
async function getAllCancelByScheduleId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = getAllCancelByScheduleId.name;
  try {
    const scheduleId = req.query.scheduleId as string;
    const page = req.query.page as string;
    const limit = req.query.limit as string;
    const patternNumFormat = /^-?\d*\.?\d+$/;
    const isStringOfNumberPage = patternNumFormat.test(page);
    const isStringOfNumberLimit = patternNumFormat.test(limit);
    if (page && !isStringOfNumberPage) {
      throw new CustomError(400, "page must be type string of number");
    }
    if (limit && !isStringOfNumberLimit) {
      throw new CustomError(400, "limit must be type string of number");
    }
    let data;
    if (page && limit) {
      data = await cancelService.getPaginatedCancelByScheduleIdService(
        scheduleId,
        +limit,
        +page
      );
      respone(
        res,
        data,
        `Get paginated all Cancel by scheduleId are successfull`,
        200
      );
      return loggerInfo(req, controllerName, 200, "Success");
    } else {
      data = await cancelService.getCancelByScheduleIdService(scheduleId);
      respone(res, data, `Get all Cancel by scheduleId are successfull`, 200);
      return loggerInfo(req, controllerName, 200, "Success");
    }
  } catch (error: any) {
    console.log("Error status:", error.statusCode);
    if (error.statusCode === 500) {
      loggerError(req, controllerName, error.statusCode, error);
    } else {
      loggerWarn(req, controllerName, error.statusCode, error);
    }
    next(error);
  }
}

export default {
  getAllCancel,
  getAllCancelByScheduleId,
};
