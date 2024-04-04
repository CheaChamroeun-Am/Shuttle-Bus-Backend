import { NextFunction, Request, Response } from "express";
import { respone } from "../../payload/respone/defaultRespone";
import dashboardService from "./dashboard.service";
import { DepartmentEnum } from "@prisma/client";
import { CustomError } from "../../handler/customError";
import {
  loggerError,
  loggerInfo,
  loggerWarn,
} from "../../config/logger/customeLogger";

// get all user dashboard
async function getAllUserDashboardController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllUserDashboardController.name;
  try {
    const allUser = await dashboardService.getAllUserService();
    respone(res, allUser, "Success", 200);
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

// get all student by departmentName
async function getAllStudentByBatchIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllStudentByBatchIdController.name;
  try {
    const departmentName = req.params.department;
    if (!departmentName) {
      throw new CustomError(400, "department is required");
    }
    if (
      !Object.values(DepartmentEnum).includes(departmentName as DepartmentEnum)
    ) {
      throw new CustomError(400, `department not exist`);
    }

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
      data =
        await dashboardService.getPaginatedAllStudentByDepartmentNameService(
          departmentName,
          +limit,
          +page
        );
      respone(
        res,
        data,
        "Get paginated all student by department are successfull",
        200
      );
      return loggerInfo(req, controllerName, 200, "Success");
    } else {
      data = await dashboardService.getAllStudentByDepartmentNameService(
        departmentName
      );
      respone(res, data, "Get all student by department are successfull", 200);
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

// get student with departmentName and batchNumber
async function getAllStudentByDepartmentNameAndBatchController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllStudentByDepartmentNameAndBatchController.name;
  try {
    const departmentName = req.params.department as DepartmentEnum;
    const batchNum = req.params.batch;
    console.log(departmentName, batchNum);

    if (!departmentName) {
      throw new CustomError(400, "department is required");
    }
    if (!batchNum) {
      throw new CustomError(400, "batch is required");
    }
    if (
      !Object.values(DepartmentEnum).includes(
        departmentName.toUpperCase() as DepartmentEnum
      )
    ) {
      throw new CustomError(400, `department not exist`);
    }

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
      data =
        await dashboardService.getPaginatedStudentByDepartmentNameAndBatchNumberService(
          departmentName,
          +batchNum,
          +limit,
          +page
        );
      respone(
        res,
        data,
        `Get all paginated student by department & batch are successful`,
        200
      );
      return loggerInfo(req, controllerName, 200, "Success");
    } else {
      data =
        await dashboardService.getStudentByDepartmentNameAndBatchNumberService(
          departmentName,
          +batchNum
        );
      respone(
        res,
        data,
        `Get all student by department & batch are successful`,
        200
      );
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
  getAllUserDashboardController,
  getAllStudentByBatchIdController,
  getAllStudentByDepartmentNameAndBatchController,
};
