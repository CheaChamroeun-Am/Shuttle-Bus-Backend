import { NextFunction, Request, Response, response } from "express";
import { respone } from "../../payload/respone/defaultRespone";
import scheduleService from "./schedule.service";
import { ScheduleDto } from "./../../payload/request/scheduleDto";
import { CustomError } from "../../handler/customError";
import moment from "moment-timezone";
import {
  loggerError,
  loggerInfo,
  loggerWarn,
} from "../../config/logger/customeLogger";
async function BatchCreateScheduleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = BatchCreateScheduleController.name;
  try {
    //check file type does it is csv or xlsx or not
    const filetype = ["xlsx", "csv", "xls"];

    //get file from request
    const file = req.file;
    //check file is null or not
    if (!file) {
      throw new CustomError(404, "File not found");
    }
    //check file type is support or not
    if (!filetype.includes(file!.originalname.split(".")[1])) {
      throw new CustomError(400, "File type not support");
    }

    const data = await scheduleService.batchCreateScheduleService(file);
    respone(res, data, "Import Schedule Successfuly", 200);
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

// create Schedule 1:
async function createScheduleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = createScheduleController.name;
  try {
    const scheduleDto = req.body as ScheduleDto;

    if (!scheduleDto.departureId) {
      throw new CustomError(400, `departureId is required`);
    }
    if (!scheduleDto.date) {
      throw new CustomError(400, `date is required`);
    }

    const schedule = await scheduleService.createScheduleService(scheduleDto);
    respone(res, schedule, "1 Schedule created successful", 200);
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

// get all schedule ---------------------------
async function getAllScheduleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllScheduleController.name;
  try {
    console.log("-- get all schedule paginated ---");
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
      data = await scheduleService.getAllSchedulePaginatedService(
        +limit,
        +page
      );
      respone(res, data, "Get all schedule paginated are successful", 200);
      return loggerInfo(req, controllerName, res.statusCode, "Success");
    } else {
      data = await scheduleService.getAllScheduleService();
      respone(res, data, "Get all schedule are successful", 200);
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

async function getAllScheduleFilterByEnableStatusController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllScheduleFilterByEnableStatusController.name;
  try {
    const enableStatus = req.query.enable as string;
    console.log("-- query enable ---", enableStatus);
    if (enableStatus !== "true" && enableStatus !== "false") {
      throw new CustomError(400, "enable must be type of boolean");
    }
    let enable = Boolean(JSON.parse(enableStatus as string));
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
      data = await scheduleService.getPaginatedAllScheduleByStatusService(
        enable,
        +limit,
        +page
      );
      respone(
        res,
        data,
        `Get all paginated schedule where enable:${enableStatus} are successful`,
        200
      );
      return loggerInfo(req, controllerName, 200, "Success(paginated)");
    } else {
      data = await scheduleService.getAllScheduleByStatusService(enable);
      respone(
        res,
        data,
        `Get all schedule where enable:${enableStatus} are successful`,
        200
      );
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

// --------------
async function getAllScheduleFilterByDateController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllScheduleFilterByDateController.name;
  try {
    let inputDateString = req.query.date as string;
    // const momentObj = moment(inputDateString, "MM-DD-YYYY").tz("UTC");

    // // Get day, month, and year
    // const day = momentObj.date() + 1;
    // const month = momentObj.month() + 1;
    // const year = momentObj.year();
    // console.log("day:", day, "month:", month, "year:", year);
    // const formatDate = `${year}-${month}-${day}T00:00:00.000Z`;

    const data = await scheduleService.getScheduleByDateService(
      inputDateString
    );
    respone(
      res,
      data,
      `Get all schedule by date:${inputDateString} are success`,
      200
    );
    return loggerInfo(req, controllerName, res.statusCode, "Success");
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

async function getAllScheduleFilterByYearAndMonthController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllScheduleFilterByYearAndMonthController.name;
  try {
    const query = req.query;

    console.log("-- query year and month ---");
    let year = Number(query.year);
    let month = Number(query.month);
    const startDate = new Date(Date.UTC(year, month - 1, 1)); // First day of month
    // console.log(startDate);
    const endDate = new Date(Date.UTC(year, month, 0)); // Last day of month
    // console.log(endDate);

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
      data = await scheduleService.getPaginatedScheduleByYearAndMonthService(
        startDate,
        endDate,
        +limit,
        +page
      );
      respone(
        res,
        data,
        `Get all paginated schedule filter by year:${year} & month:${month} are successful.`,
        200
      );
      return loggerInfo(
        req,
        controllerName,
        res.statusCode,
        "Success(paginated)"
      );
    } else {
      data = await scheduleService.getScheduleByYearAndMonthService(
        startDate,
        endDate
      );
      respone(
        res,
        data,
        `Get all schedule filter by year:${year} & month:${month} are successful.`,
        200
      );
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

// get schdule by Id
async function getScheduleByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getScheduleByIdController.name;
  try {
    const id = req.params.id;
    const schedule = await scheduleService.getScheduleByIdService(id);
    respone(res, schedule, "Get 1 schedule by Id is successful.", 200);
    return loggerInfo(req, controllerName, res.statusCode, "Success");
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

// delete schedule by Id
async function deleteScheduleByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = deleteScheduleByIdController.name;
  try {
    const id = req.params.id;
    const schedule = await scheduleService.deleteScheduleByIdService(id);
    respone(res, schedule, "1 schedule deleted successful.", 200);
    return loggerInfo(req, controllerName, res.statusCode, "Success");
  } catch (error: any) {
    if (
      error.code === "P2003" &&
      (error.meta.field_name === "Cancel_scheduleId_fkey (index)" ||
        error.meta.field_name === "Booking_scheduleId_fkey (index)" ||
        error.meta.field_name === "Waitting_scheduleId_fkey (index)")
    ) {
      loggerWarn(
        req,
        controllerName,
        400,
        "Cannot delete schedule due to schedule have a few people in cancel list or booking list or waitting list"
      );
      next(
        new CustomError(
          400,
          "Cannot delete schedule due to schedule have a few people in cancel list or booking list or waitting list"
        )
      );
    } else {
      loggerError(req, controllerName, error.statusCode, error);
      next(error);
    }
  }
}

// update schedule by Id
async function updateScheduleByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = updateScheduleByIdController.name;
  try {
    const id = req.params.id;
    const scheduleDto = req.body as ScheduleDto;
    if (!scheduleDto.departureId) {
      throw new CustomError(400, `departureId is required`);
    }
    if (!scheduleDto.date) {
      throw new CustomError(400, `date is required`);
    }
    const schedule = await scheduleService.updateScheduleByIdService(
      id,
      scheduleDto
    );
    respone(res, schedule, "1 schedule updated successful.", 200);
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

async function confirmScheduleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = confirmScheduleController.name;
  try {
    const id = req.params.id;
    if (req.query.confirm !== "true" && req.query.confirm !== "false") {
      throw new CustomError(400, "confirm must be type of boolean");
    }
    const confirm = Boolean(JSON.parse(req.query.confirm as string));

    const schedule = await scheduleService.confirmSchedule(id, confirm);
    respone(
      res,
      schedule,
      `Schedule confirmed to ${confirm ? "closed" : "re-open"} for booking.`,
      200
    );
    return loggerInfo(req, controllerName, res.statusCode, "Success");
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
  getScheduleByIdController,
  getAllScheduleController,
  getAllScheduleFilterByYearAndMonthController,
  getAllScheduleFilterByEnableStatusController,
  getAllScheduleFilterByDateController,
  BatchCreateScheduleController,
  createScheduleController,
  updateScheduleByIdController,
  confirmScheduleController,
  deleteScheduleByIdController,
};
