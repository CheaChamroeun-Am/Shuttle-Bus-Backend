import { NextFunction, Request, Response } from "express";
import departureService from "./departure.service";
import { respone } from "./../../payload/respone/defaultRespone";
import { DepartureDto } from "./../../payload/request/departureDto";
import { CustomError } from "../../handler/customError";
import {
  loggerError,
  loggerInfo,
  loggerWarn,
} from "../../config/logger/customeLogger";

// Create Departure
async function createDepartureController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = createDepartureController.name;
  try {
    const departureDto = req.body as DepartureDto;

    // convert to date format
    departureDto.departureTime = new Date(
      `1970-01-07T00:${departureDto.departureTime}.000Z`
    );
    // console.log('Time :',departureDto.departureTime);

    if (!departureDto.fromId) {
      throw new CustomError(400, `fromId is required`);
    }
    if (!departureDto.destinationId) {
      throw new CustomError(400, `destinationId is required`);
    }
    if (!departureDto.destinationId) {
      throw new CustomError(400, `destinationId is required`);
    }
    if (!departureDto.pickupLocationId) {
      throw new CustomError(400, `pickupLocationId is required`);
    }
    if (!departureDto.dropLocationId) {
      throw new CustomError(400, `dropLocationId is required`);
    }

    const departure = await departureService.createDepartureService(
      departureDto
    );
    respone(res, departure, `Success`, 200);
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

// Delete Departure by ID
async function deleteDepartureController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = deleteDepartureController.name;
  try {
    const id = req.params.id;
    const departure = await departureService.deleteDepartureByIdService(id);
    respone(res, departure, "Success", 200);
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

// update Departure:
async function updateDepartureByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = updateDepartureByIdController.name;
  try {
    const id = req.params.id;
    const departureDto = req.body as DepartureDto;

    // convert to date format
    departureDto.departureTime = new Date(
      `1970-01-07T00:${departureDto.departureTime}.000Z`
    );
    if (!departureDto.fromId) {
      throw new CustomError(400, `fromId is required`);
    }
    if (!departureDto.destinationId) {
      throw new CustomError(400, `destinationId is required`);
    }
    if (!departureDto.departureTime) {
      throw new CustomError(400, `departureTime is required`);
    }
    if (!departureDto.pickupLocationId) {
      throw new CustomError(400, `pickupLocationId is required`);
    }
    if (!departureDto.dropLocationId) {
      throw new CustomError(400, `dropLocationId is required`);
    }
    const departure = await departureService.updateDepartureByIdService(
      id,
      departureDto
    );
    respone(res, departure, "Success", 200);
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

// get Departure by Id:
async function getDepartureByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getDepartureByIdController.name;
  try {
    const id = req.params.id;
    const departure = await departureService.getDepartureByIdService(id);
    respone(res, departure, "Success", 200);
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

// get ALl departure:
async function getAllDepartureController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllDepartureController.name;
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
      data = await departureService.getPaginatedAllDepatureService(
        +limit,
        +page
      );
      respone(res, data, "Get all paginated departure are successfull", 200);
      return loggerInfo(req, controllerName, 200, "Success");
    } else {
      data = await departureService.getAllDepatureService();
      respone(res, data, "Get all departure are successfull", 200);
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
  getDepartureByIdController,
  getAllDepartureController,
  createDepartureController,
  deleteDepartureController,
  updateDepartureByIdController,
};
