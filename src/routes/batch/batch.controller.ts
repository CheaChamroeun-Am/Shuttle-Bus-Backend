import { error, log } from "console";
import { NextFunction, Request, Response } from "express";
import { respone } from "../../payload/respone/defaultRespone";
import batchService from "./batch.service";
import { BatchDto } from "../../payload/request/batchDto";
import { CustomError } from "../../handler/customError";
import { DepartmentEnum } from "@prisma/client";
import {
  loggerError,
  loggerInfo,
  loggerWarn,
} from "../../config/logger/customeLogger";

// const logger = require("../../config/logger/logger");
// create batch
async function createBatch(req: Request, res: Response, next: NextFunction) {
  const controllerName = createBatch.name;
  try {
    const batchDto = req.body as BatchDto;
    if (batchDto.batchNum == null) {
      throw new CustomError(400, "Batch number is required");
    }
    if (batchDto.department == null) {
      throw new CustomError(400, "Department is required");
    }
    const batch = await batchService.createBatchService(batchDto);
    respone(res, batch, "success", 200);
    let statusCode = res.statusCode;
    loggerInfo(req, controllerName, statusCode, "Success");
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

// get batch by id
async function getBatchById(req: Request, res: Response, next: NextFunction) {
  const controllerName = getBatchById.name;
  try {
    const { id } = req.params;
    const batch = await batchService.getBatchByIdService(id);
    if (!batch) {
      throw new CustomError(400, "Batch does not exist");
    }
    respone(res, batch, "Get batch by id is success", 200);
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
// get all batch
async function getAllBatch(req: Request, res: Response, next: NextFunction) {
  const controllerName = getAllBatch.name;
  try {
    console.log("---- get all ----");
    const batchs = await batchService.getAllBatchServie();
    respone(res, batchs, "Get all batch success", 200);
    let statusCode = res.statusCode;
    loggerInfo(req, controllerName, statusCode, "Success");
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
async function getAllBatchFilterByDepartment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const controllerName = getAllBatchFilterByDepartment.name;
  try {
    const department = req.query.department as string;
    console.log("query department:", department);
    if (
      department &&
      !Object.values(DepartmentEnum).includes(department as DepartmentEnum)
    ) {
      throw new CustomError(400, "Department does not exist");
    }
    const batchs = await batchService.getBatchByDepartmentService(department);
    respone(res, batchs, "Get all batch filter by department is success", 200);
    console.log(res.statusCode);
    let statusCode = res.statusCode;
    loggerInfo(req, controllerName, statusCode, "Success");
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

// delete batch
async function deleteBatch(req: Request, res: Response, next: NextFunction) {
  const controllerName = deleteBatch.name;
  try {
    const id = req.params.id;
    const batch = await batchService.deleteBatchService(id);
    respone(res, batch, "success", 200);
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
// update batch
async function updateBatch(req: Request, res: Response, next: NextFunction) {
  const controllerName = updateBatch.name;
  try {
    const { id } = req.params;
    const batchDto = req.body as BatchDto;
    if (batchDto.batchNum == null) {
      throw new CustomError(400, "Batch number is required");
    }
    if (batchDto.department == null) {
      throw new CustomError(400, "Department is required");
    }
    const batchUpdate = await batchService.updateBatchService(id, batchDto);
    respone(res, batchUpdate, "success", 200);
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
  getAllBatch,
  getAllBatchFilterByDepartment,
  createBatch,
  deleteBatch,
  getBatchById,
  updateBatch,
};
