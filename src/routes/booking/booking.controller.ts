import { NextFunction, Request, Response } from "express";
import { respone } from "../../../src/payload/respone/defaultRespone";
import bookingService from "./booking.service";
import { DepartmentEnum } from "@prisma/client";
import { CustomError } from "../../handler/customError";

// import path from "path";
import path from "path";
import {
  loggerError,
  loggerInfo,
  loggerWarn,
} from "../../config/logger/customeLogger";

// import file from '../../views/excel/booking.xlsx'

// create booking
async function createBookingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = createBookingController.name;
  try {
    const bookingDto = req.body;
    if (bookingDto == null) {
      throw new CustomError(400, `Body is required`);
    }
    const booking = await bookingService.createBookingService(bookingDto);
    respone(res, booking, `Success`, 200);
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

async function getBookingByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = getBookingByIdController.name;
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingByIdService(id);
    respone(res, booking, `Success`, 200);
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
async function getAllBookingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = getAllBookingController.name;
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
      data = await bookingService.getAllBookingPaginatedService(+limit, +page);
      respone(res, data, `Get all booking paginated are successfull`, 200);
      return loggerInfo(req, controllerName, 200, "Success(paginated)");
    } else {
      data = await bookingService.getAllBookingService();
      respone(res, data, `Get all booking are successfull`, 200);
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
async function cancelBookingOrWaitingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = cancelBookingOrWaitingController.name;
  try {
    const id = req.params.id;
    const booking = await bookingService.cancelBookingOrWaitingService(id);
    respone(res, booking, `Cancel Success`, 200);
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

// update booking
async function updateBooking(req: Request, res: Response, next: NextFunction) {
  const controllerName = updateBooking.name;
  try {
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

// get booking by schedule id
async function updateBookingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = updateBookingController.name;
  try {
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
async function getBookingByScheduleIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = getBookingByScheduleIdController.name;
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
      data = await bookingService.getBookingByScheduleIdPaginatedService(
        id,
        +limit,
        +page
      );
      respone(
        res,
        data,
        `Get all booking by scheduleId paginated are success`,
        200
      );
      return loggerInfo(req, controllerName, 200, "Success(paginated)");
    } else {
      data = await bookingService.getBookingByScheduleIdService(id);
      respone(res, data, `Get all booking by scheduleId are success`, 200);
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

async function swapBookingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = swapBookingController.name;
  try {
    const { fromBookedId } = req.body;
    const { withWaitingId } = req.body;
    const scheduleId = req.params.id;
    const booking: any = await bookingService.swapBookingService(
      fromBookedId,
      withWaitingId,
      scheduleId
    );
    console.log(scheduleId);

    respone(res, booking, `Swapped Successfully!`, 200);
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

// export excel of booking filter by scheduleId : done
// async function exportExcelBookingByScheduleIdController(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   try {
//     const id = req.query.id as string;

//     // Assuming the exportExcelBookingByScheduleIdService function returns the buffer
//     const buffer = await bookingService.exportExcelBookingByScheduleIdService(id);
//     if (!buffer) {
//       return res.status(404).send('Data not found.');
//     }

//     // Set the response headers for file download
//     res.setHeader('Content-Disposition', 'attachment; filename="booking.xlsx"');
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.send(buffer);

//     console.log("Buffer:", buffer);
//   } catch (error: any) {
//     // next(error);
//     return res.status(500).send(error.message);
//   }
// }
async function exportExcelBookingByScheduleIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = exportExcelBookingByScheduleIdController.name;
  try {
    // let myFile2 = "./src/util/file.excel/booking/booking.xlsx";
    let utilPath = path.resolve(__dirname, "..", "..");
    let myFile = path.resolve(
      utilPath,
      "util",
      "file.excel",
      "booking",
      "booking.xlsx"
    );

    console.log("myFile:", myFile);
    const id = req.query.scheduleId as string;
    const fs = require("fs");
    const buffer = await bookingService.exportExcelBookingByScheduleIdService(
      id
    );
    const bufferData = Buffer.from(buffer);

    // Set the response headers for file download
    fs.writeFile(myFile, bufferData, (error: any) => {
      if (error) {
        console.error("Error writing file:", error);
        throw new CustomError(500, `Error writing file`);
      } else {
        res.download(myFile);
        // res.download('./booking');
        console.log("File written successfully.");
      }
    });
    console.log("Buffer :", buffer);
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

// export excel of booking filter by date : done
async function exportExcelBookingByDateController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = exportExcelBookingByDateController.name;
  try {
    const date = new Date(req.query.date as string);
    const data = await bookingService.exportExcelBookingByDateService(date);
    respone(res, data, "Export by Date Success", 200);
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

// get booking and waiting by (date): done
async function getAllBookingAndWaitingFilterByDateController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = getAllBookingAndWaitingFilterByDateController.name;
  try {
    // const date = new Date(Object.keys(req.query)[0]); // convert to Date
    const date = new Date(req.query.date as string);
    const data =
      await bookingService.getAllBookingAndWaitingFilterByDateService(date);
    respone(
      res,
      data,
      `Get all booking and waiting by date:${req.query.date} is success`,
      200
    );
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

// get booking and waiting by (date, departmentName and batchNum): done
async function getAllBookingAndWaitingFilterByDateDepartmentAndBatchNumController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName =
    getAllBookingAndWaitingFilterByDateDepartmentAndBatchNumController.name;
  try {
    const department = req.query.department as DepartmentEnum;
    const batchNum = Number(req.query.batch);
    const date = new Date(req.query.date as string);
    if (!department) {
      throw new CustomError(400, `department is required`);
    }
    if (!Object.values(DepartmentEnum).includes(department)) {
      throw new CustomError(400, `department not exist`);
    }
    if (!batchNum) {
      throw new CustomError(400, `batch is required`);
    }
    if (!date) {
      throw new CustomError(400, `date is required`);
    }
    const data =
      await bookingService.getBookingAndWaitingFilterByDepartmentBatchAndDateService(
        department,
        batchNum,
        date
      );
    respone(
      res,
      data,
      `Get all booking & waiting filter by department:${department} & batch:${batchNum} & date:${req.query.date} is success`,
      200
    );
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

// get booking and waiting by (date, departmentName): done
async function getAllBookingAndWaitingFilterByDateAndDepartmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName =
    getAllBookingAndWaitingFilterByDateAndDepartmentController.name;
  try {
    const date = new Date(req.query.date as string);
    const department = req.query.department as DepartmentEnum;

    if (!date) {
      throw new CustomError(400, `date is required`);
    }
    if (!department) {
      throw new CustomError(400, `department is required`);
    }
    if (!Object.values(DepartmentEnum).includes(department)) {
      throw new CustomError(400, `department not exist`);
    }

    const data =
      await bookingService.getAllBookingAndWaitingByDateAndDepartmentService(
        date,
        department
      );
    respone(
      res,
      data,
      `Get all booking & waiting filter by department:${department} & date:${req.query.date} is success`,
      200
    );
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

async function getAllBookingOfUserIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = getAllBookingOfUserIdController.name;
  try {
    const id = req.query.userId as string;
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
      data = await bookingService.getAllPaginatedBookingByUserIdService(
        id,
        +limit,
        +page
      );
      respone(res, data, `Get all paginated booking of userId is success`, 200);
      return loggerInfo(req, controllerName, 200, "Success(paginated)");
    } else {
      data = await bookingService.getAllBookingByUserIdService(id);
      respone(res, data, `Get all booking of userId is success`, 200);
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

async function getAllBookingHistoryFilterByUserIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = getAllBookingHistoryFilterByUserIdController.name;
  try {
    const userId = req.query.userId as string;
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
      data = await bookingService.getAllPaginatedBookingHistoryByUserIdService(
        userId,
        +limit,
        +page
      );
      respone(
        res,
        data,
        `Get all paginated booking history of userId are success`,
        200
      );
      return loggerInfo(req, controllerName, 200, "Success(paginated)");
    } else {
      data = await bookingService.getAllBookingHistoryByUserIdService(userId);
      respone(res, data, `Get all booking history of userId are success`, 200);
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
  getAllBookingHistoryFilterByUserIdController,
  getAllBookingOfUserIdController,
  createBookingController,
  cancelBookingOrWaitingController,
  getAllBookingController,
  getBookingByIdController,
  exportExcelBookingByScheduleIdController,
  exportExcelBookingByDateController,
  updateBookingController,
  getBookingByScheduleIdController,
  swapBookingController,
  getAllBookingAndWaitingFilterByDateController,
  getAllBookingAndWaitingFilterByDateDepartmentAndBatchNumController,
  getAllBookingAndWaitingFilterByDateAndDepartmentController,
  updateBooking,
};
