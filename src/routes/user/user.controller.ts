import { DepartmentEnum, GenderEnum, RoleEnum } from "@prisma/client";
import e, { NextFunction, Request, Response } from "express";
import { respone } from "../../../src/payload/respone/defaultRespone";
import { UserDto } from "../../payload/request/userDto";
import userService from "./user.service";
import { StudentDto } from "../../payload/request/studnetDto";
import { AdminDto } from "../../payload/request/adminDto";
import { StaffDto } from "../../payload/request/staffDto";
import { mail } from "../../util/mailSender";
import { CustomError } from "../../handler/customError";
import fs from "fs";
import { decryptText } from "../../util/decrypt";
import {
  loggerError,
  loggerInfo,
  loggerWarn,
} from "../../config/logger/customeLogger";

async function exportAllUser(req: Request, res: Response, next: NextFunction) {
  let controllerName = exportAllUser.name;
  try {
    const query = req.query;
    const role = query.role;
    const department = req.query.department;
    const batch = req.query.batch;
    const status = req.query.status;

    let exportPath: any;

    if (role && department && batch && status) {
      let query_role = String(role).toUpperCase() as RoleEnum;
      let query_department = String(department).toUpperCase() as DepartmentEnum;
      if (!["STUDENT"].includes(query_role)) {
        throw new CustomError(400, "Role outside of STUDENT is not allow");
      }
      if (!Object.values(DepartmentEnum).includes(query_department)) {
        throw new CustomError(400, `department not found`);
      }
      const isInKrr = status === "in" ? true : status === "out" ? false : null;
      if (isInKrr === null) {
        throw new CustomError(400, "Status not found");
      }
      exportPath = await userService.exportStudentOfDepartmentBatchByStatus(
        query_role,
        query_department,
        +batch,
        isInKrr
      );
    }
    // export student by department and batch
    else if (role && department && batch) {
      let query_role = String(role).toUpperCase() as RoleEnum;
      let query_department = String(department).toUpperCase() as DepartmentEnum;
      if (!["STUDENT"].includes(query_role)) {
        throw new CustomError(400, "Role outside of STUDENT is not allow");
      }
      if (!Object.values(DepartmentEnum).includes(query_department)) {
        throw new CustomError(400, `department not found`);
      }
      exportPath = await userService.exportStudentByDepartmentAndbatch(
        query_role,
        query_department,
        +batch
      );
    }

    // export student by department
    else if (role && department) {
      let query_role = String(role).toUpperCase() as RoleEnum;
      let query_department = String(department).toUpperCase() as DepartmentEnum;

      if (!["STUDENT"].includes(query_role)) {
        throw new CustomError(400, "Role outside of STUDENT is not allow");
      }
      if (!Object.values(DepartmentEnum).includes(query_department)) {
        throw new CustomError(400, `department not found`);
      }
      exportPath = await userService.exportStudentByDepartment(
        query_role,
        query_department
      );
    }

    // export users by role and status(in or out)
    else if (role && status) {
      //done
      let query_role = String(role).toUpperCase() as RoleEnum;

      if (!["STUDENT", "STAFF"].includes(query_role)) {
        throw new CustomError(400, "Role not found");
      }
      const isInKrr = status === "in" ? true : status === "out" ? false : null;
      if (isInKrr === null) {
        throw new CustomError(400, "Status not found");
      }
      exportPath = await userService.exportUserByRoleAndStatus(
        query_role,
        isInKrr
      );
    }

    // export users by role
    else if (role) {
      //done
      let query_role = String(role).toUpperCase() as RoleEnum;
      if (!["STUDENT", "STAFF"].includes(query_role)) {
        throw new CustomError(400, "Role not found");
      }
      exportPath = await userService.exportUserByRole(query_role);
    }

    // export users by status(in or out)
    else if (status) {
      // done
      const isInKrr = status === "in" ? true : status === "out" ? false : null;
      if (isInKrr === null) {
        throw new CustomError(400, "Status not found");
      }
      exportPath = await userService.exportUserByStatus(isInKrr);
    }

    // export All users
    else {
      //done

      exportPath = await userService.exportUsers();
    }

    const downloadFilename = "ShuttleBus.xlsx";

    fs.promises.stat(exportPath).then((stat) => {
      if (stat.isFile()) {
        res.download(exportPath, downloadFilename, (err) => {
          if (err) {
            loggerError(req, controllerName, 500, err.message);
          } else {
            fs.unlinkSync(exportPath);
            loggerInfo(req, controllerName, 200, "Success");
          }
        });
      }
    });
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

// ------------------------------------
async function getAllUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getAllUserController.name;
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
      data = await userService.getAllUserPaginatedService(+limit, +page);
      respone(res, data, `Get all user paginated are successful.`, 200);
      return loggerInfo(req, controllerName, 200, "Success");
    } else {
      data = await userService.getAllUserService();
      respone(res, data, `Get all user are successful.`, 200);
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

async function handleEnableStudentOfDeptAndBatchByBatchIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName =
    handleEnableStudentOfDeptAndBatchByBatchIdController.name;
  try {
    const role = req.query.role as RoleEnum;
    const batchId = req.query.batchId as string;
    const enable = req.body.enable as boolean;
    console.log(
      "--- Handle enable student of department and batch by batchId ---"
    );

    if (!role) {
      throw new CustomError(400, "Role is required");
    }
    if (!batchId) {
      throw new CustomError(400, "BatchId is required");
    }
    if (!Object.values(RoleEnum).includes(role.toUpperCase() as RoleEnum)) {
      throw new CustomError(400, "Role not exist");
    }
    if (enable !== true && enable !== false) {
      throw new CustomError(400, "enable must be type of boolean");
    }
    const user =
      await userService.handleEnableStudentOfDepartmentAndBatchByBatchIdService(
        role,
        batchId,
        enable
      );
    respone(
      res,
      user,
      `${
        enable ? "Enaled" : "Disabled"
      } all user(student) by batchID are successful.`,
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

async function handleEnableAllUserByRoleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = handleEnableAllUserByRoleController.name;
  try {
    const role = req.query.role as RoleEnum;
    const enableStatus = req.body.enable;
    if (!role) {
      throw new CustomError(400, `Role is required`);
    }
    if (!Object.values(RoleEnum).includes(role.toUpperCase() as RoleEnum)) {
      throw new CustomError(400, `Role not exist`);
    }
    if (enableStatus !== true && enableStatus !== false) {
      throw new CustomError(400, "enable must be type of boolean");
    }
    let enable = Boolean(JSON.parse(enableStatus as string));
    const user = await userService.handleEnableAllUserByRoleService(
      role,
      enable
    );
    respone(
      res,
      user,
      `All user with role ${role} are ${
        enable ? "Enabled" : "Disabled"
      } success`,
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

async function importUser(req: Request, res: Response, next: NextFunction) {
  let controllerName = importUser.name;
  try {
    //check file type does it is csv or xlsx or not
    const filetype = ["xlsx", "csv", "xls"];
    //get file from request
    const file = req.file;
    //check file is null or not
    if (!file) {
      throw new CustomError(404, `File not found`);
    }
    //check file type is support or not
    if (!filetype.includes(file!.originalname.split(".")[1])) {
      throw new CustomError(400, `File type not support`);
    }
    const result = await userService.importUserService(file);

    respone(res, result, "Import successful.", 200);
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

async function exportStudentByDepartmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = exportStudentByDepartmentController.name;
  try {
    const department = req.query.department as DepartmentEnum;
    console.log("Export by department", department);

    if (!department) {
      throw new CustomError(400, `department is required`);
    }
    if (!Object.values(DepartmentEnum).includes(department)) {
      throw new CustomError(400, `department not exist`);
    }

    const students = await userService.exportStudentByDepartmentService(
      department
    );
    respone(res, students, "Export Successful.", 200);
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

async function exportStudentByDepartmentAndBatchController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = exportStudentByDepartmentAndBatchController.name;
  try {
    const department = req.query.department as DepartmentEnum;
    const batchNum = Number(req.query.batch);
    if (!department) {
      throw new CustomError(400, `department is required`);
    }
    if (!Object.values(DepartmentEnum).includes(department)) {
      throw new CustomError(400, `department not exist`);
    }
    if (!batchNum) {
      throw new CustomError(400, `batchNum is required`);
    }
    const students = await userService.exportStudentByDepartmentAndBatchService(
      department,
      batchNum
    );
    respone(res, students, "Export Successful.", 200);
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
async function changePasswordController(
  req: any,
  res: Response,
  next: NextFunction
) {
  let controllerName = changePasswordController.name;
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword) {
      throw new CustomError(400, `Old password is required`);
    }
    if (!newPassword) {
      throw new CustomError(400, `New Passowrd is required`);
    }
    console.log(req.user.id);

    const user = await userService.changePasswordService(
      req.user.id,
      oldPassword,
      newPassword
    );
    respone(res, user, "Success", 200);
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
async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = loginController.name;
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new CustomError(400, `email is required`);
    }
    if (!password) {
      throw new CustomError(400, `password is required`);
    }

    const user = await userService.loginService(email.toLowerCase(), password);
    respone(res, user, `Login successful.`, 200);
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
async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = registerController.name;
  try {
    const userDto = req.body as UserDto;
    if (!userDto.email) {
      throw new CustomError(400, `email is required`);
    }
    if (!userDto.password) {
      throw new CustomError(400, `password is required`);
    }
    if (!userDto.username) {
      throw new CustomError(400, `name is required`);
    }
    if (!userDto.phone) {
      throw new CustomError(400, `phone is required`);
    }
    if (!userDto.gender) {
      throw new CustomError(400, `gender is required`);
    }
    const user = await userService.registerService(userDto);
    respone(res, user, `Success`, 200);
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
async function requestResetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = requestResetPasswordController.name;
  try {
    const email = req.body.email;
    if (!email) {
      throw new CustomError(400, `email is required`);
      return;
    }
    const user = await userService.requestResetPasswordService(email);
    respone(res, user, `Success`, 200);
    loggerInfo(req, controllerName, 200, "Success");
  } catch (error: any) {
    if (error.statusCode === 500) {
      loggerError(req, controllerName, error.statusCode, error);
    } else {
      loggerWarn(req, controllerName, error.statusCode, error);
    }
    next(error);
  }
}
async function getTemplateResetPasswordWithTokenController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getTemplateResetPasswordWithTokenController.name;
  try {
    const token = req.params.token;
    return res.render("forget_password", { url: token });
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
async function confirmResetPasswordWithTokenController(
  req: any,
  res: Response,
  next: NextFunction
) {
  let controllerName = confirmResetPasswordWithTokenController.name;
  try {
    const { password } = req.body;
    const email = req.user.email;
    const user = await userService.confirmResetPasswordWithTokenService(
      password,
      email
    );
    res.render("reset_password_succesfully");
    return loggerInfo(req, controllerName, 200, "reset_password_succesfully");
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

async function createUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = createUserController.name;
  try {
    let role = req.body.role as RoleEnum;
    if (!role) {
      throw new CustomError(400, `Role is required`);
    }
    if (!Object.values(RoleEnum).includes(role)) {
      throw new CustomError(400, `Role not exist`);
    }
    if (role === RoleEnum.STUDENT) {
      const studentDto = req.body as StudentDto;
      if (!studentDto.role) {
        throw new CustomError(400, `Role is required`);
        return;
      }
      if (!studentDto.email) {
        throw new CustomError(400, `Email is required`);
      }
      if (!studentDto.username) {
        throw new CustomError(400, `Username is required`);
      }
      if (!studentDto.password) {
        throw new CustomError(400, `Password is required`);
      }
      if (studentDto.password.length < 5) {
        throw new CustomError(
          400,
          "Password must contain atleast 5 characters."
        );
      }
      if (
        (studentDto.department as DepartmentEnum) &&
        !Object.values(DepartmentEnum).includes(
          studentDto.department as DepartmentEnum
        )
      ) {
        throw new CustomError(400, `department not exist`);
      }
      if (!studentDto.gender) {
        throw new CustomError(400, `Gender is required`);
      }
      if (studentDto.inKRR === null) {
        throw new CustomError(400, `Current location(inKRR) is required`);
      }
      if (!studentDto.department) {
        throw new CustomError(400, `Department is required`);
      }
      if (!studentDto.batchNum) {
        throw new CustomError(400, `Batch number is required`);
      }
      // create Student
      const userOfStudent = await userService.createStudentService(studentDto);
      mail(studentDto.email, studentDto.username, studentDto.password);
      respone(
        res,
        userOfStudent,
        `1 student created successful, please check your email.`,
        201
      );
      return loggerInfo(req, controllerName, 201, "Success");
    }
    if (role === RoleEnum.STAFF) {
      const staffDto = req.body as StaffDto;
      if (!staffDto.role) {
        throw new CustomError(400, `Role is required`);
      }
      if (!staffDto.email) {
        throw new CustomError(400, `Email is required`);
      }
      if (!staffDto.username) {
        throw new CustomError(400, `Username is required`);
      }
      if (!staffDto.password) {
        throw new CustomError(400, `Password is required`);
      }
      if (staffDto.password.length < 5) {
        throw new CustomError(
          400,
          "Password must contain atleast 5 characters"
        );
      }
      // create Staff
      const userOfStaff = await userService.createStaffService(staffDto);
      respone(res, userOfStaff, `1 staff created successful.`, 200);
      return loggerInfo(req, controllerName, 200, "Success");
    }
    if (role === RoleEnum.ADMIN) {
      const adminDto = req.body as AdminDto;
      if (!adminDto.role) {
        throw new CustomError(400, "Role is required");
      }
      if (!adminDto.email) {
        throw new CustomError(400, `Email is required`);
      }
      if (!adminDto.username) {
        throw new CustomError(400, `Username is required`);
      }
      if (!adminDto.password) {
        throw new CustomError(400, `Password is required`);
      }
      if (adminDto.password.length < 5) {
        throw new CustomError(
          400,
          "Password must contain atleast 5 characters"
        );
      }
      // create Admin
      const userOfAdmin = await userService.createAdminService(adminDto);
      respone(res, userOfAdmin, `1 admin created successful.`, 200);
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

async function updateUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = updateUserController.name;
  try {
    let role = req.body.role as RoleEnum;
    switch (role) {
      case RoleEnum.STUDENT:
        const userIdOfStudent = req.params.id;
        const newStudentDto = req.body as StudentDto;
        if (!newStudentDto.role || newStudentDto.role === null) {
          throw new CustomError(400, `Role is required`);
        }
        if (!newStudentDto.email || newStudentDto.email === null) {
          throw new CustomError(400, `Email is required`);
        }
        if (!newStudentDto.username || newStudentDto.username === null) {
          throw new CustomError(400, `Username is required`);
        }
        // if (newStudentDto.password && newStudentDto.password === null) {
        //   respone(res, null, "Password is required", 400);
        //   return;
        // }
        if (newStudentDto.password && newStudentDto.password.length < 5) {
          throw new CustomError(
            400,
            "Password must contain atleast 5 characters."
          );
        }

        if (
          (newStudentDto.department as DepartmentEnum) &&
          !Object.values(DepartmentEnum).includes(
            newStudentDto.department as DepartmentEnum
          )
        ) {
          throw new CustomError(400, `department not exist`);
        }
        if (!newStudentDto.gender || newStudentDto.gender === null) {
          throw new CustomError(400, `Gender is required`);
        }
        if (newStudentDto.inKRR === null) {
          throw new CustomError(400, `Current location(inKRR) is required`);
        }
        if (!newStudentDto.department || newStudentDto.department === null) {
          throw new CustomError(400, `Department is required`);
        }
        if (!newStudentDto.batchNum || newStudentDto.batchNum === null) {
          throw new CustomError(400, `Batch number is required`);
        }

        // create Student
        const newUserOfStudent = await userService.updateStudentByUserId(
          userIdOfStudent,
          newStudentDto
        );
        respone(res, newUserOfStudent, `1 student updated successful`, 200);
        loggerInfo(req, controllerName, 200, "Create student is successfully");
        break;
      case RoleEnum.STAFF:
        const userIdOfStaff = req.params.id;
        const newStaffDto = req.body as StaffDto;
        if (!newStaffDto.role || newStaffDto.role === null) {
          throw new CustomError(400, `Role is required`);
        }
        if (!newStaffDto.email || newStaffDto.email === null) {
          throw new CustomError(400, `Email is required`);
        }
        if (!newStaffDto.username || newStaffDto.username === null) {
          throw new CustomError(400, `Username is required`);
        }
        if (newStaffDto.password && newStaffDto.password.length < 5) {
          throw new CustomError(
            400,
            "Password must contain atleast 5 characters"
          );
        }
        if (!newStaffDto.gender || newStaffDto.gender === null) {
          throw new CustomError(400, `Gender is required`);
        }
        if (newStaffDto.inKRR === null) {
          throw new CustomError(400, `Current location(inKRR) is required`);
        }
        // update Staff
        const newUserOfStaff = await userService.updateStaffByUserId(
          userIdOfStaff,
          newStaffDto
        );
        respone(res, newUserOfStaff, `1 staff updated successful`, 200);
        loggerInfo(req, controllerName, 200, "Create staff is successfully");
        break;
      case RoleEnum.ADMIN:
        const userIdOfAdmin = req.params.id;
        const newAdminDto = req.body as AdminDto;
        if (!newAdminDto.role || newAdminDto.role === null) {
          throw new CustomError(400, `Role is required`);
        }
        if (!newAdminDto.email || newAdminDto.email === null) {
          throw new CustomError(400, `Email is required`);
        }
        if (!newAdminDto.username || newAdminDto.username === null) {
          throw new CustomError(400, `Username is required`);
        }

        if (newAdminDto.password && newAdminDto.password.length < 5) {
          throw new CustomError(
            400,
            "Password must contain atleast 5 characters"
          );
        }
        if (!newAdminDto.gender || newAdminDto.gender === null) {
          throw new CustomError(400, `Gender is required`);
        }
        if (newAdminDto.inKRR === null) {
          throw new CustomError(400, `Current location(inKRR) is required`);
        }
        // update Admin
        const userOfAdmin = await userService.updateAdminByUserId(
          userIdOfAdmin,
          newAdminDto
        );
        respone(res, userOfAdmin, `1 admin updated successful`, 200);
        loggerInfo(req, controllerName, 200, "Create admin is successfully");
        break;
      default:
        throw new CustomError(404, "Role not exist");
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
async function deleteUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = deleteUserController.name;
  try {
    const userId = req.params.id;
    const user = await userService.deleteUserService(userId);
    respone(res, user, `Delete success`, 200);
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

async function getUserByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = getUserByIdController.name;
  try {
    const userId = req.params.id;
    const user = await userService.getUserByIdService(userId);
    respone(res, user, `Get user by Id is successful.`, 200);
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
async function loginAdminController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = loginAdminController.name;
  try {
    const { email, password } = req.body;
    if (!password && !email) {
      throw new CustomError(
        400,
        "Please provide a valid email and password to proceed with the login."
      );
    }
    if (!email) {
      throw new CustomError(400, `email is required`);
    }
    if (!password) {
      throw new CustomError(400, `password is required`);
    }
    const user = await userService.loginAdminService(
      email.toLowerCase(),
      password
    );
    respone(res, user, `Login successful.`, 200);
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
async function requestResetPasswordAdminController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = requestResetPasswordAdminController.name;
  try {
    const email = req.body.email;
    if (!email) {
      throw new CustomError(400, `email is required`);
    }
    const user = await userService.requestResetPasswordAdminService(email);
    respone(res, user, `Success`, 200);
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
async function login_vkclukController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const email = req.body.email;
    if (!email) {
      respone(res, null, `email is required`, 400);
      return;
    }
    const user = await userService.requestResetPasswordAdminService(email);
    respone(res, null, `Success`, 200);
  } catch (error) {
    next(error);
  }
}

async function loginVKclubController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let controllerName = loginVKclubController.name;
  try {
    const encryptedEmail = req.body.email;
    if (!encryptedEmail) {
      throw new CustomError(400, "Invalid email address");
    }
    // Decrypt the encrypted email
    const decryptedBuffer = decryptText(encryptedEmail);

    const email = decryptedBuffer.toString("utf-8");
    console.log(email);

    const validEmailPattern = /^[\w-]+(\.[\w-]+)*@gmail\.com$/;
    const validKitEmailPattern = /^[\w-]+(\.[\w-]+)*@kit\.edu\.kh$/;

    if (validEmailPattern.test(email) || validKitEmailPattern.test(email)) {
      const user = await userService.loginVKclub(email);
      respone(res, user, "Login successful.", 200);
      loggerInfo(req, controllerName, 200, "Login successful");
    } else {
      throw new CustomError(400, "Invalid email address");
    }
  } catch (err: any) {
    console.log(err);
    let error;
    if (
      err.message ==
      "error:04099079:rsa routines:RSA_padding_check_PKCS1_OAEP_mgf1:oaep decoding error"
    ) {
      error = new CustomError(400, "Invalid email address");
      loggerWarn(req, controllerName, 400, "Invalid email address");
    } else {
      error = err;
      loggerError(req, controllerName, error.statusCode, error);
    }
    next(error);
  }
}

export default {
  confirmResetPasswordWithTokenController,
  getTemplateResetPasswordWithTokenController,
  requestResetPasswordController,
  requestResetPasswordAdminController,
  registerController,
  loginController,
  changePasswordController,
  createUserController,
  deleteUserController,
  getAllUserController,
  updateUserController,
  handleEnableStudentOfDeptAndBatchByBatchIdController,
  handleEnableAllUserByRoleController,
  importUser,
  exportStudentByDepartmentController,
  exportStudentByDepartmentAndBatchController,
  getUserByIdController,
  loginAdminController,
  loginVKclubController,
  exportAllUser,
};
