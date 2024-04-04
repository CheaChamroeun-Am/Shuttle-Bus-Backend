import { NextFunction, Request, Response } from "express";
import { respone } from "../../payload/respone/defaultRespone";
import refillService from "../ticket/ticket.service";
import { CustomError } from "../../handler/customError";
import { DepartmentEnum, RoleEnum } from "@prisma/client";
import {
  loggerError,
  loggerInfo,
  loggerWarn,
} from "../../config/logger/customeLogger";

async function refillAllUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = refillAllUserController.name;
  try {
    const { type, amount, include, batchNum, department } = req.body;

    if (type == null) {
      throw new CustomError(400, `type is required`);
    }
    if (amount == null) {
      throw new CustomError(400, `amount is required`);
    }
    if (include == null) {
      throw new CustomError(400, `include is required`);
    }
    if (type.toUpperCase() === "BATCH" && batchNum == null) {
      throw new CustomError(400, `batchNum is required`);
    }
    const data = await refillService.refillAllUser(
      type,
      batchNum,
      include,
      amount,
      department
    );
    respone(res, data, `Refill ticket for all user are successful.`, 200);
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

async function refillTicketAllUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = refillTicketAllUserController.name;
  try {
    const { amount, include } = req.body;

    if (amount == null) {
      throw new CustomError(400, `amount is required`);
    }
    if (include == null) {
      throw new CustomError(400, `include is required`);
    }

    const data = await refillService.refillTicketAllUser(amount, include);
    respone(res, data, `Refill ticket for all user are successful.`, 200);
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

async function refillAllFilterByRoleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = refillAllFilterByRoleController.name;
  try {
    const role = req.query.role as RoleEnum;
    const { amount, include } = req.body;
    console.log(role);

    if (!["STAFF", "STUDENT"].includes(role)) {
      throw new CustomError(400, `Role is invalid for refill`);
    }
    if (amount == null) {
      throw new CustomError(400, `amount is required`);
    }
    if (include == null) {
      throw new CustomError(400, `include is required`);
    }

    const data = await refillService.refillTicketAllUserWithRole(
      role,
      amount,
      include
    );
    respone(
      res,
      data,
      `Refill ticket for all user by Role are successful.`,
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

async function refillTicketAllUserFilterByDepartmentAndBatchController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName =
    refillTicketAllUserFilterByDepartmentAndBatchController.name;
  try {
    const department = req.query.department as DepartmentEnum;
    const batchNum = Number(req.query.batch);
    const { amount, include } = req.body;
    if (amount == null) {
      throw new CustomError(400, `amount is required`);
    }
    if (include == null) {
      throw new CustomError(400, `include is required`);
    }
    const data = await refillService.refillTicketWithDepartmentAndBatch(
      batchNum,
      include,
      amount,
      department
    );
    respone(
      res,
      data,
      `Refill ticket for all user filter by department & batchNum are successful.`,
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

async function refillTicketAllUserFilterByDepartmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = refillTicketAllUserFilterByDepartmentController.name;
  try {
    const department = req.query.department as DepartmentEnum;
    const { amount, include } = req.body;
    if (amount == null) {
      throw new CustomError(400, `amount is required`);
    }
    if (include == null) {
      throw new CustomError(400, `include is required`);
    }
    const data = await refillService.refillTicketWithDepartment(
      include,
      amount,
      department
    );
    respone(
      res,
      data,
      `Refill ticket for all user filter by department are successful.`,
      200
    );
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
async function refillParticularUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = refillParticularUserController.name;
  try {
    const { listUser, amount, include } = req.body;
    if (listUser == null || listUser.length == 0) {
      throw new CustomError(400, `listUser is required`);
    }
    if (amount == null) {
      throw new CustomError(400, `amount is required`);
    }
    if (include == null) {
      throw new CustomError(400, `include is required`);
    }
    const data = await refillService.refillParticularUser(
      listUser,
      amount,
      include
    );
    respone(
      res,
      data,
      `Refill ticket for particular user are successful.`,
      200
    );
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
export default {
  refillAllUserController,
  // ----
  refillTicketAllUserController,
  refillAllFilterByRoleController,
  refillTicketAllUserFilterByDepartmentController,
  refillTicketAllUserFilterByDepartmentAndBatchController,
  refillParticularUserController,
};
