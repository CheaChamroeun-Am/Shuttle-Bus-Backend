import { NextFunction, Request, Response } from "express";
import { respone } from "../../../src/payload/respone/defaultRespone";
import waitingService from "./waiting.service";
import { CustomError } from "../../handler/customError";
import {
  loggerError,
  loggerInfo,
  loggerWarn,
} from "../../config/logger/customeLogger";

async function getAllWaitingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllWaitingController.name;
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
      data = await waitingService.getPaginatedAllWaitingService(+limit, +page);
      respone(
        res,
        data,
        `Get paginated all waiting users are successful.`,
        200
      );
      return loggerInfo(req, controllerName, 200, "Success");
    } else {
      data = await waitingService.getAllWaitingService();
      respone(res, data, `Get all waiting users are successful.`, 200);
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

async function getWaitingByScheduleIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getWaitingByScheduleIdController.name;
  try {
    const id = req.query.scheduleId as string;
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
      data = await waitingService.getPaginatedWaitingByScheduleIdService(
        id,
        +limit,
        +page
      );
      respone(
        res,
        data,
        `Get paginated waiting by scheduleId are success`,
        200
      );
      return loggerInfo(req, controllerName, 200, "Success");
    } else {
      data = await waitingService.getWaitingByScheduleIdService(id);
      respone(res, data, `Get waiting by scheduleId are success`, 200);
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
async function deleteAllWaitingsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = deleteAllWaitingsController.name;
  try {
    const waiting = await waitingService.deleteAllWaitingService();
    respone(res, waiting, `All wating deleted success`, 200);
    return loggerInfo(req, controllerName, 200, "Success");
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
async function deleteAllWaitingsByScheduleIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = deleteAllWaitingsByScheduleIdController.name;
  try {
    const id = req.params.scheduleId as string;
    const waiting = await waitingService.deleteWaitingByScheduleId(id);
    respone(res, waiting, `Delate all wating by scheduleId are success`, 200);
    return loggerInfo(req, controllerName, 200, "Success");
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
async function getAllWaitingOfUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllWaitingOfUserController.name;
  try {
    const userId = req.query.userId as string;
    const waiting = await waitingService.getAllWaitingByUserIdService(userId);
    respone(res, waiting, `Get waing data of userId are success`, 200);
    loggerInfo(req, controllerName, 200, "Success");
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
  getAllWaitingOfUserController,
  getAllWaitingController,
  getWaitingByScheduleIdController,
  deleteAllWaitingsController,
  deleteAllWaitingsByScheduleIdController,
};
