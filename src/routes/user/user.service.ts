import {
  AdminInfo,
  DepartmentEnum,
  GenderEnum,
  PrismaClient,
  RoleEnum,
  StaffInfo,
  StudentInfo,
  Ticket,
  User,
} from "@prisma/client";
import { mail, mailResetPassword } from "../../util/mailSender";
import excelJS from "exceljs";
import { comparePassword, encryptPassword } from "../../util/passwordEncrypter";
import jwt from "../../util/jwt-generate";
import { UserDto } from "../../payload/request/userDto";
import { StudentDto } from "../../payload/request/studnetDto";
import { AdminDto } from "../../payload/request/adminDto";
import { StaffDto } from "../../payload/request/staffDto";
import { CustomError } from "../../handler/customError";
import { v4 as uuidv4 } from "uuid";
import excelService from "../../util/excel";
import path from "path";

const readXlsxFile = require("read-excel-file/node");
const prisma = new PrismaClient();
const selectDefaultStudentForGenerate = {
  id: true,
  email: true,
  username: true,
  role: true,
  phone: true,
  gender: true,
  inKRR: true,
  enable: true,
  studentInfo: {
    select: {
      batch: {
        select: {
          department: true,
          batchNum: true,
        },
      },
    },
  },
};
const selectTicketDto = {
  remainTicket: true,
  ticketLimitInhand: true,
};

const selectStudentInfoDefault = {
  id: true,
  batch: {
    select: {
      id: true,
      department: true,
      batchNum: true,
    },
  },
};

// function for create TicketData
async function createTicketData(ticket: Ticket) {
  return await prisma.ticket.create({
    data: ticket,
  });
}
// function for create StudentData
async function createStudentInforData(studentInfo: StudentInfo) {
  return await prisma.studentInfo.create({
    data: studentInfo,
  });
}
// function  for create StaffData
async function createStaffInforData(staffInfo: StaffInfo) {
  return await prisma.staffInfo.create({
    data: staffInfo,
  });
}
// function for create AdminData
async function createAdminInfoData(adminInfo: AdminInfo) {
  return await prisma.adminInfo.create({
    data: adminInfo,
  });
}

async function existingUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
}
// done
async function createStudentService(studentDto: StudentDto) {
  // check existing email
  const existingEmail = await existingUserByEmail(studentDto.email);
  if (existingEmail) {
    throw new CustomError(409, "Email already in used");
  }
  // checking batch:
  const existingBatch = await prisma.batch.findUnique({
    where: {
      department_batchNum: {
        department: studentDto.department as DepartmentEnum,
        batchNum: studentDto.batchNum as number,
      },
    },
  });
  if (!existingBatch) {
    throw new CustomError(404, "Department or Batch not found");
  }

  const userData = {
    email: studentDto.email,
    username: studentDto.username,
    password: studentDto.password,
    googlePassword: studentDto.googlePassword || null,
    role: RoleEnum.STUDENT,
    phone: studentDto.phone || null,
    gender: studentDto.gender || null,
    inKRR: (studentDto.inKRR as boolean) || false,
    updatedAt: null,
  } as User;

  // - encrypt passowrd
  userData.password = await encryptPassword(userData.password as string);
  if (userData.googlePassword || userData.googlePassword !== null) {
    userData.googlePassword = await encryptPassword(
      userData.googlePassword as string
    );
  }
  // const User, StudentInfo, Ticket:
  const student = await prisma.user.create({
    data: {
      ...userData,
      ticket: {
        create: {
          updatedAt: null,
        },
      },
      studentInfo: {
        create: {
          batchId: existingBatch.id || null,
        },
      },
    },
  });

  return student;
}
// done
async function createAdminService(adminDto: AdminDto) {
  // check existing email
  const existingEmail = await existingUserByEmail(adminDto.email);
  if (existingEmail) {
    throw new CustomError(409, "Email already in used");
  }
  const userData = {
    email: adminDto.email,
    username: adminDto.username,
    password: adminDto.password,
    googlePassword: adminDto.googlePassword || null,
    role: RoleEnum.ADMIN,
    phone: adminDto.phone || null,
    gender: adminDto.gender || null,
    inKRR: adminDto.inKRR || false,
    updatedAt: null,
  } as User;

  // - encrypt passowrd
  userData.password = await encryptPassword(userData.password as string);
  if (userData.googlePassword || userData.googlePassword !== null) {
    userData.googlePassword = await encryptPassword(
      userData.googlePassword as string
    );
  }

  // create User, AdminInfo:
  const admin = await prisma.user.create({
    data: {
      ...userData,
      adminInfo: {
        create: {},
      },
    },
  });
  return admin;
}
// done
async function createStaffService(staffDto: StaffDto) {
  // check existing email
  const existingEmail = await existingUserByEmail(staffDto.email);
  if (existingEmail) {
    throw new CustomError(409, "Email already in used");
  }

  const userData = {
    email: staffDto.email,
    username: staffDto.username,
    password: staffDto.password,
    googlePassword: staffDto.googlePassword || null,
    role: RoleEnum.STAFF,
    phone: staffDto.phone || null,
    gender: staffDto.gender || null,
    inKRR: staffDto.inKRR || false,
    updatedAt: null,
  } as User;

  // - encrypt passowrd
  userData.password = await encryptPassword(userData.password as string);
  if (userData.googlePassword || userData.googlePassword !== null) {
    userData.googlePassword = await encryptPassword(
      userData.googlePassword as string
    );
  }

  // create User, Ticket, StaffInfo
  const staff = await prisma.user.create({
    data: {
      ...userData,
      ticket: {
        create: {
          updatedAt: null,
        },
      },
      staffInfo: {
        create: {},
      },
    },
  });
  return staff;
}
// done
async function deleteUserService(userId: string) {
  // check id exist or not:
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!existingUser || existingUser === null) {
    throw new CustomError(204, "User not found");
  }

  // delete user --> Ticket, StudentInfo also delete
  return await prisma.user.delete({
    where: {
      id: userId,
    },
  });
}
// -------------------------------------
async function getAllUserService() {
  return await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      gender: true,
      inKRR: true,
      password: true,
      phone: true,
      enable: true,
      ticket: {
        select: {
          id: true,
          remainTicket: true,
          ticketLimitInhand: true,
          updatedAt: true,
        },
      },
      studentInfo: {
        select: {
          id: true,
          batch: {
            select: {
              id: true,
              department: true,
              batchNum: true,
            },
          },
        },
      },
      staffInfo: true,
      adminInfo: true,
      superAdminInfo: true,
    },
  });
}
async function getAllUserPaginatedService(limit: number, page: number) {
  const total = await prisma.user.count();
  const pages = Math.ceil(total / limit);
  if (page > pages) {
    throw new CustomError(404, `Sorry maximum page is ${pages}`);
  }
  const res = await prisma.user.findMany({
    take: limit,
    skip: (page - 1) * limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      gender: true,
      inKRR: true,
      password: true,
      phone: true,
      enable: true,
      ticket: {
        select: {
          id: true,
          remainTicket: true,
          ticketLimitInhand: true,
          updatedAt: true,
        },
      },
      studentInfo: {
        select: {
          id: true,
          batch: {
            select: {
              id: true,
              department: true,
              batchNum: true,
            },
          },
        },
      },
      staffInfo: true,
      adminInfo: true,
      superAdminInfo: true,
    },
  });
  return {
    pagination: {
      totalData: total,
      totalPage: pages,
      dataPerPage: limit,
      currentPage: page,
    },
    data: res,
  };
}
// done
async function getUserByIdService(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      gender: true,
      inKRR: true,
      phone: true,
      ticket: {
        select: {
          id: true,
          remainTicket: true,
          ticketLimitInhand: true,
          updatedAt: true,
        },
      },
      studentInfo: {
        select: {
          id: true,
          batch: {
            select: {
              id: true,
              department: true,
              batchNum: true,
            },
          },
        },
      },
      staffInfo: true,
      adminInfo: true,
      superAdminInfo: true,
    },
  });
  if (!user || user === null) {
    throw new CustomError(404, "User not found");
  }
  return user;
}
// done
async function updateStudentByUserId(
  userId: string,
  newStudentDto: StudentDto
) {
  // check email:
  const existingEmail = await existingUserByEmail(newStudentDto.email);
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  // if email input is exist in database && email that existed is not belong to user that we want to update
  // in short: if we didn't update email and keep it same as before
  if (existingEmail && user?.email !== newStudentDto.email) {
    throw new CustomError(409, "Eamil already existed");
  }

  // check department:
  const existingDepartmentAndBatch = await prisma.batch.findUnique({
    where: {
      department_batchNum: {
        department: newStudentDto.department as DepartmentEnum,
        batchNum: newStudentDto.batchNum as number,
      },
    },
  });
  if (!existingDepartmentAndBatch || existingDepartmentAndBatch === null) {
    throw new CustomError(204, "Department with batch is not existed");
  }

  const newUserData = {
    enable: newStudentDto.enable,
    email: newStudentDto.email,
    username: newStudentDto.username,
    password:
      newStudentDto.password === null
        ? user?.password
        : await encryptPassword(newStudentDto.password as string),
    googlePassword:
      newStudentDto.googlePassword === null && user?.googlePassword == null
        ? null
        : newStudentDto.googlePassword != null
        ? await encryptPassword(newStudentDto.googlePassword as string)
        : user?.googlePassword,
    phone: newStudentDto.phone ?? "",
    gender: newStudentDto.gender ?? GenderEnum.MALE,
    inKRR: newStudentDto.inKRR ?? false,
    role: newStudentDto.role ?? RoleEnum.STUDENT,
  } as User;
  console.log(newUserData);

  // update: User, StudentInfo
  const newUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...newUserData,
      studentInfo: {
        update: {
          batchId: existingDepartmentAndBatch.id || null,
        },
      },
    },
  });
  return newUser;
}
// done
async function updateStaffByUserId(userId: string, newStafftDto: StaffDto) {
  // check email:
  const existingEmail = await existingUserByEmail(newStafftDto.email);
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  // if email input is exist in database && email that existed is not belong to user that we want to update
  // in short: if we didn't update email and keep it same as before
  if (existingEmail && user?.email !== newStafftDto.email) {
    throw new CustomError(409, "Eamil already existed");
  }

  const newUserData = {
    enable: newStafftDto.enable,
    email: newStafftDto.email,
    username: newStafftDto.username,
    password:
      newStafftDto.password == null
        ? user?.password
        : await encryptPassword(newStafftDto.password as string),
    googlePassword:
      newStafftDto.googlePassword == null && user?.googlePassword == null
        ? null
        : newStafftDto.googlePassword != null
        ? await encryptPassword(newStafftDto.googlePassword as string)
        : user?.googlePassword,
    phone: newStafftDto.phone || null,
    gender: newStafftDto.gender || null,
    inKRR: newStafftDto.inKRR || null,
    role: newStafftDto.role || null,
  } as User;

  // update: User, StudentInfo
  const newUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: newUserData,
  });
  return newUser;
}
// done
async function updateAdminByUserId(userId: string, newAdminDto: AdminDto) {
  // check email:
  const existingEmail = await existingUserByEmail(newAdminDto.email);
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  // if email input is exist in database && email that existed is not belong to user that we want to update
  // in short: if we didn't update email and keep it same as before
  if (existingEmail && user?.email !== newAdminDto.email) {
    throw new CustomError(409, "Eamil already existed");
  }

  const newUserData = {
    enable: newAdminDto.enable,
    email: newAdminDto.email,
    username: newAdminDto.username,
    password:
      newAdminDto.password === null
        ? user?.password
        : await encryptPassword(newAdminDto.password as string),
    googlePassword:
      newAdminDto.googlePassword == null && user?.googlePassword == null
        ? null
        : newAdminDto.googlePassword != null
        ? await encryptPassword(newAdminDto.googlePassword as string)
        : user?.googlePassword,
    phone: newAdminDto.phone || null,
    gender: newAdminDto.gender || null,
    inKRR: newAdminDto.inKRR || null,
  } as User;

  // update: User, StudentInfo
  const newUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: newUserData,
  });
  return newUser;
}
// generate student by department name:
async function exportStudentByDepartmentService(department: DepartmentEnum) {
  const data = await prisma.user.findMany({
    where: {
      AND: [
        { role: RoleEnum.STUDENT },
        {
          studentInfo: {
            batch: {
              department,
            },
          },
        },
      ],
    },
    select: selectDefaultStudentForGenerate,
  });

  // throw error when there is no data
  if (data.length === 0 || !data) {
    throw new CustomError(404, "no data");
  }

  // sheet name
  const workbook = new excelJS.Workbook();

  // const path = "./excelFiles"
  const excelPath = path.join(__dirname, "../../util/file.excel");
  console.log(excelPath);
  const sheetName =
    department === DepartmentEnum.ARCHITECTURE
      ? `DAR`
      : department === DepartmentEnum.TOURISMANDMANAGEMENT
      ? `DTM`
      : "DSE";
  const worksheet = workbook.addWorksheet(sheetName);

  // Column for data in excel. key must match data key
  worksheet.columns = [
    {
      header: "No",
      key: "index",
      width: 2,
    },
    {
      header: "Username",
      key: "username",
      width: 20,
    },
    {
      header: "Gender",
      key: "gender",
      width: 10,
    },
    {
      header: "Department",
      key: "department",
      width: 20,
    },
    {
      header: "Email",
      key: "email",
      width: 20,
    },
    {
      header: "Phone",
      key: "phone",
      width: 20,
    },
    {
      header: "Status",
      key: "status",
      width: 20,
    },
    {
      header: "Enable",
      key: "enable",
      width: 20,
    },
  ];

  // Looping through student data:
  let index = 1;
  data.forEach((student) => {
    const studentData = {
      index: index,
      gender: student.gender === GenderEnum.MALE ? "Male" : "Female",
      username: student.username,
      email: student.email,
      phone: student.phone,
      status: student.inKRR === true ? "In Kirirom" : "Not in Kirirom",
      enable: student.enable === true ? "enable" : "disable",
      department:
        student.studentInfo?.batch?.department == DepartmentEnum.ARCHITECTURE
          ? `DAR-B${student.studentInfo?.batch.batchNum}`
          : student.studentInfo?.batch?.department ==
            DepartmentEnum.TOURISMANDMANAGEMENT
          ? `DTM-B${student.studentInfo?.batch.batchNum}`
          : `DSE-B${student.studentInfo?.batch?.batchNum}`,
    };
    worksheet.addRow(studentData); // add data in row
    index++;
  });
  // Making first line in excel bold
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  const currentDate = new Date().toISOString().substring(0, 10);
  return await workbook.xlsx.writeFile(
    `${excelPath}/student/ShuttleBus ${sheetName} ${currentDate}.xlsx`
  );
}
// generate student by batch (department and batch number)
async function exportStudentByDepartmentAndBatchService(
  department: DepartmentEnum,
  batchNum: number
) {
  const data = await prisma.user.findMany({
    where: {
      AND: [
        { role: RoleEnum.STUDENT },
        {
          studentInfo: {
            batch: {
              department,
              batchNum,
            },
          },
        },
      ],
    },
    select: selectDefaultStudentForGenerate,
  });

  // throw error when there is no data
  if (data.length === 0 || !data) {
    throw new CustomError(404, "no data");
  }

  // sheet name
  const workbook = new excelJS.Workbook();
  // const path = "./excelFiles";
  const excelPath = path.join(__dirname, "../../util/file.excel");
  const sheetName =
    department === DepartmentEnum.ARCHITECTURE
      ? `DAR`
      : department === DepartmentEnum.TOURISMANDMANAGEMENT
      ? `DTM`
      : `DSE`;
  const worksheet = workbook.addWorksheet(sheetName);

  // Column for data in excel. key must match data key
  worksheet.columns = [
    {
      header: "No",
      key: "index",
      width: 2,
    },
    {
      header: "Username",
      key: "username",
      width: 20,
    },
    {
      header: "Gender",
      key: "gender",
      width: 10,
    },
    {
      header: "Department",
      key: "department",
      width: 20,
    },
    {
      header: "Email",
      key: "email",
      width: 20,
    },
    {
      header: "Phone",
      key: "phone",
      width: 20,
    },
    {
      header: "Status",
      key: "status",
      width: 20,
    },
    {
      header: "Enable",
      key: "enable",
      width: 20,
    },
  ];

  // Looping through student data:
  let index = 1;
  data.forEach((student) => {
    const studentData = {
      index: index,
      gender: student.gender === GenderEnum.MALE ? "Male" : "Female",
      username: student.username,
      email: student.email,
      phone: student.phone,
      status: student.inKRR === true ? "In Kirirom" : "Not in Kirirom",
      enable: student.enable === true ? "enable" : "disable",
      department:
        student.studentInfo?.batch?.department == DepartmentEnum.ARCHITECTURE
          ? `DAR-B${student.studentInfo?.batch.batchNum}`
          : student.studentInfo?.batch?.department ==
            DepartmentEnum.TOURISMANDMANAGEMENT
          ? `DTM-B${student.studentInfo?.batch.batchNum}`
          : `DSE-B${student.studentInfo?.batch?.batchNum}`,
    };
    worksheet.addRow(studentData); // add data in row
    index++;
  });
  // Making first line in excel bold
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  const currentDate = new Date().toISOString().substring(0, 10);
  return await workbook.xlsx.writeFile(
    `${excelPath}/student/ShuttleBus ${sheetName}-B${batchNum} ${currentDate}.xlsx`
  );
}
async function changePasswordService(
  userId: string,
  oldPassword: string,
  newPassword: string
) {
  const check = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!check) {
    throw new CustomError(404, "User not found");
  }
  const checkPassword = comparePassword(oldPassword, check.password || "");
  if (!checkPassword) {
    throw new CustomError(401, "Wrong password");
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: await encryptPassword(newPassword),
    },
  });
  return user;
}
async function loginService(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      role: true,
      enable: true,
    },
  });
  if (!user) {
    throw new CustomError(401, "Invalid credentials");
  }
  if (user.role === RoleEnum.ADMIN) {
    throw new CustomError(401, "Admin is not user");
  }
  if (!user.enable) {
    throw new CustomError(401, "User is disabled");
  }
  const checkPassword = await comparePassword(password, user.password || "");
  if (!checkPassword) {
    throw new CustomError(401, "Wrong password");
  }
  const token = jwt.jwtGenerator(user as User);
  return token;
}
async function registerService(userDto: UserDto) {
  const gender =
    userDto.gender.toUpperCase() == "MALE"
      ? GenderEnum.MALE
      : GenderEnum.FEMALE;
  const user = await prisma.user.create({
    data: {
      username: userDto.username,
      email: userDto.email,
      password: userDto.password,
      role: RoleEnum.CUSTOMER,
      enable: true,
      phone: userDto.phone,
      gender: gender,
    },
  });
  return user;
}
async function getUserByEmailService(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      role: true,
      enable: true,
    },
  });
  return user;
}
async function requestResetPasswordService(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      role: true,
      enable: true,
    },
  });
  if (!user) {
    throw new CustomError(404, "User not found");
  }
  await mailResetPassword(email, user.username || "");
  return null;
}
async function confirmResetPasswordWithTokenService(
  pass: string,
  email: string
) {
  const checkUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!checkUser) {
    throw new CustomError(404, "User not found");
  }
  const user = await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      password: await encryptPassword(pass),
    },
  });
}
async function handleEnableAllUserByRoleService(
  role: RoleEnum,
  enableStatus: boolean
) {
  const check = await prisma.user.findMany({
    where: {
      role: role.toUpperCase() as RoleEnum,
    },
  });
  if (check.length == 0) {
    throw new CustomError(404, "No user found");
  }
  return await prisma.user.updateMany({
    where: {
      role: role,
    },
    data: {
      enable: enableStatus,
    },
  });
}

// done
async function handleEnableStudentOfDepartmentAndBatchByBatchIdService(
  role: RoleEnum,
  batchId: string,
  enableStatus: boolean
) {
  const check = await prisma.user.findMany({
    where: {
      role: role,
      studentInfo: {
        batchId: batchId,
      },
    },
  });
  if (check.length == 0) {
    throw new CustomError(404, "No user found");
  }

  return await prisma.user.updateMany({
    where: {
      role: role,
      studentInfo: {
        batchId: batchId,
      },
    },
    data: {
      enable: enableStatus,
    },
  });
}
// done
async function disableStudentByBatchService(role: RoleEnum, batchId: string) {
  const check = await prisma.user.findMany({
    where: {
      role: role,
      studentInfo: {
        batchId: batchId,
      },
    },
    include: {
      studentInfo: {
        select: selectStudentInfoDefault,
      },
    },
  });
  if (check.length == 0) {
    throw new CustomError(404, "No user found");
  }
  return await prisma.user.updateMany({
    where: {
      role: role,
      studentInfo: {
        batchId: batchId,
      },
    },
    data: {
      enable: false,
    },
  });
}
async function viewUserBookingHistoryService(userId: string) {
  return await prisma.user.findMany({
    where: {
      id: userId,
      booking: {
        every: {
          status: "USED",
        },
      },
    },
    select: {
      id: true,
      createdAt: true,
      booking: {
        select: {
          id: true,
          createdAt: true,
          status: true,
          updatedAt: true,
          payStatus: true,
          schedule: {
            select: {
              id: true,
              date: true,
              bus: {
                select: {
                  id: true,
                  driverName: true,
                  plateNumber: true,
                  model: true,
                  numOfSeat: true,
                  driverContact: true,
                },
              },
              availableSeat: true,
              departure: {
                select: {
                  id: true,
                  departureTime: true,
                  destination: {
                    select: {
                      id: true,
                      mainLocationName: true,
                    },
                  },
                  from: {
                    select: {
                      id: true,
                      mainLocationName: true,
                    },
                  },
                  dropLocation: {
                    select: {
                      subLocationName: true,
                    },
                  },
                  pickupLocation: {
                    select: {
                      subLocationName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}
async function importUserService(file: any) {
  var listUser: User[] = [];
  await readXlsxFile(Buffer.from(file.buffer)).then(async (data: any) => {
    for (let i = 1; i < data.length; i++) {
      const userRole = data[i][4];

      //check if user already exist
      const checkUser = await prisma.user.findUnique({
        where: {
          email: data[i][3],
        },
      });
      if (checkUser) {
        throw new CustomError(401, "User already exist");
      }
      if (userRole === RoleEnum.STUDENT) {
        var checkBatch = await prisma.batch.findUnique({
          where: {
            department_batchNum: {
              department: data[i][8],
              batchNum: data[i][7],
            },
          },
        });
        if (checkBatch == null) {
          checkBatch = await prisma.batch.create({
            data: {
              department: data[i][8],
              batchNum: data[i][7],
            },
          });
        }
        const enPwd = await encryptPassword(data[i][2].toString());

        // encrypt password before add into database
        const user = await prisma.user.create({
          data: {
            username: data[i][1],
            gender: data[i][5],
            phone: `${data[i][6]}`,
            email: data[i][3],
            password: `${enPwd}`,
            role: userRole,
            updatedAt: null,
            studentInfo: {
              create: {
                batchId: checkBatch.id,
              },
            },
            ticket: {
              create: {},
            },
          },
        });
        const mailSend = await mail(data[i][3], data[i][1], data[i][2]).catch(
          (err) => console.log(err)
        );
        console.log(data[i][3] + " send mail done .!");
        listUser.push(user);
      } else if (userRole === RoleEnum.STAFF) {
        const staff = await prisma.user.create({
          data: {
            username: data[i][1],
            gender: data[i][5],
            phone: `${data[i][6]}`,
            email: data[i][3],
            password: `${data[i][2]}`,
            role: userRole,
            updatedAt: null,
            staffInfo: {
              create: {},
            },
            ticket: {
              create: {},
            },
          },
        });
        const mailSend = await mail(data[i][3], data[i][1], data[i][2]);
        console.log(data[i][3] + " send mail done .!");
        listUser.push(staff);
      } else if (userRole === RoleEnum.ADMIN) {
        const admin = await prisma.user.create({
          data: {
            username: data[i][1],
            gender: data[i][5],
            phone: `${data[i][6]}`,
            email: data[i][3],
            password: `${data[i][2]}`,
            role: userRole,
            updatedAt: null,
            adminInfo: {
              create: {},
            },
            ticket: {
              create: {},
            },
          },
        });
        const mailSend = await mail(data[i][3], data[i][1], data[i][2]);
        console.log(data[i][3] + " send mail done .!");
        listUser.push(admin);
      } else if (userRole === RoleEnum.CUSTOMER) {
        // implement in next phase
      }
    }
  });
  return listUser;
}
async function loginAdminService(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      role: true,
      enable: true,
    },
  });
  if (!user) {
    throw new CustomError(
      401,
      `Invalid email. Please check the email address you entered and try again.`
    );
  }
  if (user.role !== RoleEnum.ADMIN && user.role !== RoleEnum.SUPERADMIN) {
    throw new CustomError(401, "Admin side cannot login with User credentail.");
  }
  if (!user.enable) {
    throw new CustomError(401, "Your account has been suspended.");
  }
  console.log("Password Zin:", user.password);
  console.log("Password Input:", password);

  const checkPassword = await comparePassword(password, user.password || "");

  if (!checkPassword) {
    throw new CustomError(
      401,
      "Wrong password. Please check the password you entered and try again."
    );
  }
  const token = jwt.jwtGenerator(user as User);
  return token;
}
async function requestResetPasswordAdminService(email: string) {
  const checkUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!checkUser) {
    throw new CustomError(404, "User not found");
  }

  if (checkUser!.role != "ADMIN" && checkUser!.role != "SUPERADMIN") {
    throw new CustomError(409, "You do have permission to access.");
  } else {
    const mailSend = await mailResetPassword(email, checkUser.username || "");
    return mailSend;
  }
}

async function loginVKclub(email: string) {
  console.log(email);
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!existingUser) {
    const randomPassword = generateRandomPassword();
    const userData = {
      email: email,
      username: email.split("@")[0],
      password: "Empty",
      googlePassword: randomPassword,
      role: RoleEnum.STUDENT,
      phone: "Empty",
      gender: GenderEnum.MALE,
      inKRR: false,
      updatedAt: null,
    } as User;
    const newUser = await prisma.user.create({
      data: {
        ...userData,
      },
    });
    const token = jwt.jwtGenerator(newUser as User);
    return token;
  } else {
    const token = jwt.jwtGenerator(existingUser as User);
    return token;
  }
}
function generateRandomPassword(): string {
  const uuid = uuidv4();
  const password = uuid.split("-")[0];
  return password;
}
async function exportUsers() {
  const data = [];
  let index = 1;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are zero-indexed
  const day = currentDate.getDate();
  const listUsers = await prisma.user.findMany({
    where: {
      role: {
        notIn: ["ADMIN", "SUPERADMIN"],
      },
    },
    orderBy: [{ role: "asc" }, { inKRR: "asc" }],
    include: {
      studentInfo: {
        select: {
          batch: true,
        },
      },
    },
  });

  for (let user of listUsers) {
    data.push({
      index: index,
      date: `${day}-${month}-${year}`,
      username: user.username || "--:--",
      status: user.inKRR ? "In KRR" : "Out KRR",
      role: String(user.role?.toLocaleLowerCase()),
      gender: user.gender ? String(user.gender?.toLocaleLowerCase()) : "--:--",
      department:
        user.studentInfo?.batch?.department === "SOFTWAREENGINEERING"
          ? `SE-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "TOURISMANDMANAGEMENT"
          ? `TM-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "ARCHITECTURE"
          ? `AC-B${user.studentInfo?.batch?.batchNum}`
          : "--:--",
      email: user.email || "--:--",
      phone: user.phone || "--:--",
    });
    index++;
  }

  // res
  const sheetName = "All-User";
  const res = await excelService.downloadExcel(data, sheetName);
  return res;
}

async function exportUserByStatus(status: boolean) {
  const data = [];
  let index = 1;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are zero-indexed
  const day = currentDate.getDate();

  const listUsers = await prisma.user.findMany({
    where: {
      inKRR: status,
      role: {
        notIn: ["ADMIN", "SUPERADMIN"],
      },
    },
    orderBy: [{ role: "asc" }, { inKRR: "asc" }],
    include: {
      studentInfo: {
        select: {
          batch: true,
        },
      },
    },
  });

  for (let user of listUsers) {
    data.push({
      index: index,
      date: `${day}-${month}-${year}`,
      username: user.username || "--:--",
      status: user.inKRR ? "In KRR" : "Out KRR",
      role: String(user.role?.toLocaleLowerCase()),
      gender: user.gender ? String(user.gender?.toLocaleLowerCase()) : "--:--",
      department:
        user.studentInfo?.batch?.department === "SOFTWAREENGINEERING"
          ? `SE-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "TOURISMANDMANAGEMENT"
          ? `TM-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "ARCHITECTURE"
          ? `AC-B${user.studentInfo?.batch?.batchNum}`
          : "--:--",
      email: user.email || "--:--",
      phone: user.phone || "--:--",
    });
    index++;
  }

  // res
  const status_inkrr = status ? "In KRR" : "Out KRR";
  const sheetName = `All-User ${status_inkrr}`;
  const res = await excelService.downloadExcel(data, sheetName);
  return res;
}

async function exportUserByRoleAndStatus(role: RoleEnum, status: boolean) {
  const data = [];
  let index = 1;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are zero-indexed
  const day = currentDate.getDate();

  const listUsers = await prisma.user.findMany({
    where: {
      AND: [{ inKRR: status }, { role: role }],
    },
    orderBy: [{ role: "asc" }, { inKRR: "asc" }],
    include: {
      studentInfo: {
        select: {
          batch: true,
        },
      },
    },
  });

  for (let user of listUsers) {
    data.push({
      index: index,
      date: `${day}-${month}-${year}`,
      username: user.username || "--:--",
      status: user.inKRR ? "In KRR" : "Out KRR",
      role: String(user.role?.toLocaleLowerCase()),
      gender: user.gender ? String(user.gender?.toLocaleLowerCase()) : "--:--",
      department:
        user.studentInfo?.batch?.department === "SOFTWAREENGINEERING"
          ? `SE-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "TOURISMANDMANAGEMENT"
          ? `TM-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "ARCHITECTURE"
          ? `AC-B${user.studentInfo?.batch?.batchNum}`
          : "--:--",
      email: user.email || "--:--",
      phone: user.phone || "--:--",
    });
    index++;
  }

  // res
  const status_inkrr = status ? "In KRR" : "Out KRR";
  const sheetName = `All-${
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  } ${status_inkrr}`;

  let res;
  if (role === "STUDENT") {
    res = await excelService.downloadExcelStudent(data, sheetName);
  } else {
    res = await excelService.downloadExcelStaff(data, sheetName);
  }
  return res;
}

async function exportStudentByDepartment(
  role: RoleEnum,
  department: DepartmentEnum
) {
  const data = [];
  let index = 1;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are zero-indexed
  const day = currentDate.getDate();

  const listUsers = await prisma.user.findMany({
    where: {
      AND: [
        { role: role },
        {
          studentInfo: {
            batch: {
              department: department,
            },
          },
        },
      ],
    },
    orderBy: [{ role: "asc" }, { inKRR: "asc" }],
    include: {
      studentInfo: {
        select: {
          batch: true,
        },
      },
    },
  });

  for (let user of listUsers) {
    data.push({
      index: index,
      date: `${day}-${month}-${year}`,
      username: user.username || "--:--",
      status: user.inKRR ? "In KRR" : "Out KRR",
      role: String(user.role?.toLocaleLowerCase()),
      gender: user.gender ? String(user.gender?.toLocaleLowerCase()) : "--:--",
      department:
        user.studentInfo?.batch?.department === "SOFTWAREENGINEERING"
          ? `SE-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "TOURISMANDMANAGEMENT"
          ? `TM-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "ARCHITECTURE"
          ? `AC-B${user.studentInfo?.batch?.batchNum}`
          : "--:--",
      email: user.email || "--:--",
      phone: user.phone || "--:--",
    });
    index++;
  }

  // res
  const dept =
    department === "SOFTWAREENGINEERING"
      ? "DSE"
      : department === "TOURISMANDMANAGEMENT"
      ? "DTM"
      : department === "ARCHITECTURE"
      ? "DAC"
      : "N/A";
  const sheetName = `Student-${dept}`;

  const res = await excelService.downloadExcelStudent(data, sheetName);
  return res;
}

async function exportStudentByDepartmentAndbatch(
  role: RoleEnum,
  department: DepartmentEnum,
  batch: number
) {
  const data = [];
  let index = 1;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are zero-indexed
  const day = currentDate.getDate();

  const listUsers = await prisma.user.findMany({
    where: {
      AND: [
        { role: role },
        {
          studentInfo: {
            batch: {
              department: department,
              batchNum: batch,
            },
          },
        },
      ],
    },
    orderBy: [{ role: "asc" }, { inKRR: "asc" }],
    include: {
      studentInfo: {
        select: {
          batch: true,
        },
      },
    },
  });

  for (let user of listUsers) {
    data.push({
      index: index,
      date: `${day}-${month}-${year}`,
      username: user.username || "--:--",
      status: user.inKRR ? "In KRR" : "Out KRR",
      role: String(user.role?.toLocaleLowerCase()),
      gender: user.gender ? String(user.gender?.toLocaleLowerCase()) : "--:--",
      department:
        user.studentInfo?.batch?.department === "SOFTWAREENGINEERING"
          ? `SE-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "TOURISMANDMANAGEMENT"
          ? `TM-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "ARCHITECTURE"
          ? `AC-B${user.studentInfo?.batch?.batchNum}`
          : "--:--",
      email: user.email || "--:--",
      phone: user.phone || "--:--",
    });
    index++;
  }

  // res
  const dept =
    department === "SOFTWAREENGINEERING"
      ? "DSE"
      : department === "TOURISMANDMANAGEMENT"
      ? "DTM"
      : department === "ARCHITECTURE"
      ? "DAC"
      : "N/A";
  const sheetName = `Student ${dept}-B${batch}`;

  const res = await excelService.downloadExcelStudent(data, sheetName);
  return res;
}

async function exportStudentOfDepartmentBatchByStatus(
  role: RoleEnum,
  department: DepartmentEnum,
  batch: number,
  status: boolean
) {
  const data = [];
  let index = 1;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are zero-indexed
  const day = currentDate.getDate();

  const listUsers = await prisma.user.findMany({
    where: {
      AND: [
        { role: role },
        { inKRR: status },
        {
          studentInfo: {
            batch: {
              department: department,
              batchNum: batch,
            },
          },
        },
      ],
    },
    orderBy: [{ role: "asc" }, { inKRR: "asc" }],
    include: {
      studentInfo: {
        select: {
          batch: true,
        },
      },
    },
  });

  for (let user of listUsers) {
    data.push({
      index: index,
      date: `${day}-${month}-${year}`,
      username: user.username || "--:--",
      status: user.inKRR ? "In KRR" : "Out KRR",
      role: String(user.role?.toLocaleLowerCase()),
      gender: user.gender ? String(user.gender?.toLocaleLowerCase()) : "--:--",
      department:
        user.studentInfo?.batch?.department === "SOFTWAREENGINEERING"
          ? `SE-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "TOURISMANDMANAGEMENT"
          ? `TM-B${user.studentInfo?.batch?.batchNum}`
          : user.studentInfo?.batch?.department === "ARCHITECTURE"
          ? `AC-B${user.studentInfo?.batch?.batchNum}`
          : "--:--",
      email: user.email || "--:--",
      phone: user.phone || "--:--",
    });
    index++;
  }

  // res
  const status_inkrr = status ? "In KRR" : "Out KRR";
  const dept =
    department === "SOFTWAREENGINEERING"
      ? "DSE"
      : department === "TOURISMANDMANAGEMENT"
      ? "DTM"
      : department === "ARCHITECTURE"
      ? "DAC"
      : "N/A";
  const sheetName = `Student ${dept}-B${batch} ${status_inkrr}`;

  const res = await excelService.downloadExcelStudent(data, sheetName);
  return res;
}

async function exportUserByRole(role: RoleEnum) {
  const data = [];
  let index = 1;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Months are zero-indexed
  const day = currentDate.getDate();

  const listUsers = await prisma.user.findMany({
    where: {
      role: role as RoleEnum,
    },
    include: {
      studentInfo: {
        select: {
          batch: true,
        },
      },
    },
  });

  for (let user of listUsers) {
    data.push({
      index: index,
      date: `${day}-${month}-${year}`,
      username: user.username || "--:--",
      status: user.inKRR ? "In KRR" : "Out KRR",
      role: String(user.role?.toLocaleLowerCase()),
      gender: user.gender ? String(user.gender?.toLocaleLowerCase()) : "--:--",
      department:
        user.role === "STUDENT" && user.studentInfo?.batch?.department
          ? user.studentInfo?.batch?.department === "SOFTWAREENGINEERING"
            ? `SE-B${user.studentInfo?.batch?.batchNum}`
            : user.studentInfo?.batch?.department === "TOURISMANDMANAGEMENT"
            ? `TM-B${user.studentInfo?.batch?.batchNum}`
            : user.studentInfo?.batch?.department === "ARCHITECTURE"
            ? `AC-B${user.studentInfo?.batch?.batchNum}`
            : "--:--"
          : "--:--",
      email: user.email || "--:--",
      phone: user.phone || "--:--",
    });
    index++;
  }

  const sheetName = `All-${
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  }`;
  // res
  let res;
  if (role === "STUDENT") {
    res = await excelService.downloadExcelStudent(data, sheetName);
  } else if (role === "STAFF") {
    res = await excelService.downloadExcelStaff(data, sheetName);
  } else {
    res = await excelService.downloadExcel(data, role);
  }

  return res;
}

export default {
  exportUsers,
  exportUserByStatus,
  exportUserByRole,
  exportStudentByDepartment,
  exportUserByRoleAndStatus,
  exportStudentOfDepartmentBatchByStatus,
  exportStudentByDepartmentAndbatch,
  getAllUserService,
  getAllUserPaginatedService,
  getUserByEmailService,
  getUserByIdService,
  createStudentService,
  createAdminService,
  createStaffService,
  updateStudentByUserId,
  updateStaffByUserId,
  updateAdminByUserId,
  deleteUserService,
  confirmResetPasswordWithTokenService,
  registerService,
  loginService,
  changePasswordService,
  handleEnableAllUserByRoleService,
  handleEnableStudentOfDepartmentAndBatchByBatchIdService,
  disableStudentByBatchService,
  viewUserBookingHistoryService,
  importUserService,
  exportStudentByDepartmentService,
  exportStudentByDepartmentAndBatchService,
  requestResetPasswordService,
  loginAdminService,
  requestResetPasswordAdminService,
  loginVKclub,
};
