import { NextFunction, Request, Response } from "express";
import { MainLocationDto } from "../../payload/request/mainLocationDto";
import { respone } from "../../payload/respone/defaultRespone";
import mainLocationService from "./mainLocation.service";
import { CustomError } from "../../handler/customError";
import {
  loggerError,
  loggerInfo,
  loggerWarn,
} from "../../config/logger/customeLogger";

async function createMainLocationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = createMainLocationController.name;
  try {
    const mainLocationDto = req.body as MainLocationDto;
    if (mainLocationDto.mainLocationName == null) {
      throw new CustomError(400, `mainLocationName is required`);
    }
    const mainLocation = await mainLocationService.createMainLocationService(
      mainLocationDto
    );
    respone(res, mainLocation, `1 mainLocation created successful`, 200);
    loggerInfo(req, controllerName, res.statusCode, "Success");
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

async function getMainLocationByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getMainLocationByIdController.name;
  try {
    const { id } = req.params;
    const mainLocations = await mainLocationService.getMainLocationByIdService(
      id
    );
    respone(res, mainLocations, `Get mainLocation by id is success`, 200);
    loggerInfo(req, controllerName, res.statusCode, "Success");
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

async function getAllMainLocationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllMainLocationController.name;
  try {
    console.log("-- get all --");
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
      data = await mainLocationService.getPaginatedAllMainLocationServie(
        +limit,
        +page
      );
      respone(res, data, `Get paginated all mainLocation are successfull`, 200);
      return loggerInfo(req, controllerName, 200, "Success");
    } else {
      data = await mainLocationService.getAllMainLocationServie();
      respone(res, data, `Get all mainLocation are successfull`, 200);
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

async function getAllMainLocationFilterByNameController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllMainLocationFilterByNameController.name;
  try {
    const location = req.query.location as string;
    console.log("-- query name --", location);
    const mainLocation =
      await mainLocationService.getMainLocationIdByNameService(location);
    if (!mainLocation) {
      throw new CustomError(404, `Not found mainLocation`);
    }
    respone(
      res,
      mainLocation,
      `Get all mainLocation filter by Name success`,
      200
    );
    loggerInfo(req, controllerName, res.statusCode, "Success");
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
async function deleteMainLocationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = deleteMainLocationController.name;
  try {
    const { id } = req.params;
    const mainLocation = await mainLocationService.deleteMainLocationService(
      id
    );
    respone(res, mainLocation, `Success`, 200);
    loggerInfo(req, controllerName, res.statusCode, "Success");
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
async function updateMainLocationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = updateMainLocationController.name;
  try {
    const { id } = req.params;
    const mainLocationDto = req.body as MainLocationDto;
    if (mainLocationDto.mainLocationName == null) {
      throw new CustomError(400, `mainLocationName is required`);
    }
    const mainLocation = await mainLocationService.updateMainLocationService(
      id,
      mainLocationDto
    );

    respone(res, mainLocation, `Success`, 200);
    loggerInfo(req, controllerName, res.statusCode, "Success");
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
  createMainLocationController,
  deleteMainLocationController,
  getAllMainLocationController,
  getAllMainLocationFilterByNameController,
  getMainLocationByIdController,
  updateMainLocationController,
};
