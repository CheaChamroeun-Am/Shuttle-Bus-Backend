import { DepartmentEnum, PrismaClient } from "@prisma/client";
import {
  AdminDashboardDto,
  StaffDashboardDto,
  StudentDashboardDto,
} from "../../payload/request/dashboardResponeDto";
import { CustomError } from "../../handler/customError";

const prisma = new PrismaClient();
const selectUserDefault = {
  id: true,
  username: true,
  email: true,
  role: true,
  inKRR: true,
  enable: true,
  ticket: {
    select: {
      id: true,
      remainTicket: true,
      ticketLimitInhand: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  studentInfo: true,
  staffInfo: true,
  adminInfo: true,
};

const selectStudentDefault = {
  id: true,
  username: true,
  email: true,
  role: true,
  inKRR: true,
  enable: true,
  ticket: true,
  studentInfo: true,
};

// Get All user: (enable and disable) both inKrr & outKrr with percentage of user out and in Krr and detail about user
async function getAllUserService() {
  const data = await prisma.user.findMany({
    select: selectUserDefault,
    orderBy: {
      username: "asc",
    },
  });

  // all user student, staff, admin : enable = true and false, inKrr = true and false
  const allUserData = {
    student: data.filter((user) => user.role === "STUDENT"),
    staff: data.filter((user) => user.role === "STAFF"),
    admin: data.filter((user) => user.role === "ADMIN"),
  };

  // create student array  --> to avoid adminInfor: null or staffInfo : null
  const studentList: StudentDashboardDto[] = [];
  allUserData.student.forEach((student) => {
    studentList.push({
      id: student.id,
      username: student.username,
      email: student.email,
      role: student.role,
      inKRR: student.inKRR,
      enable: student.enable,
      ticket: student.ticket,
      studentInfo: student.studentInfo,
    });
  });

  // create staff  --> to avoid studentInfo: null or adminInfo : null
  const staffList: StaffDashboardDto[] = [];
  allUserData.staff.forEach((staff) => {
    staffList.push({
      id: staff.id,
      username: staff.username,
      email: staff.email,
      role: staff.role,
      inKRR: staff.inKRR,
      enable: staff.enable,
      ticket: staff.ticket,
      staffInfo: staff.staffInfo,
    });
  });

  // create admin  --> to avoid studentInfo: null or staffInfo : null
  const adminList: AdminDashboardDto[] = [];
  allUserData.admin.forEach((admin) => {
    adminList.push({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      inKRR: admin.inKRR ?? false,
      enable: admin.enable,
      ticket: admin.ticket,
      adminInfo: admin.adminInfo,
    });
  });

  //    -- all user in kRR && enable == true
  const allUserInKrr = {
    student: studentList.filter((student) => student.inKRR === true),
    staff: staffList.filter((staff) => staff.inKRR === true),
    admin: adminList.filter((admin) => admin.inKRR === true),
  };

  //    -- all user out of kRR && enable == true
  const allUserOutKrr = {
    student: studentList.filter((student) => student.inKRR === false),
    staff: staffList.filter((staff) => staff.inKRR === false),
    admin: adminList.filter((admin) => admin.inKRR === false),
  };

  // calculate percentage:
  function calculatePercatage(total: number, num: number) {
    return (num * 100) / total;
  }

  const numOfAllUserEnable = data.length;
  const numOfAllUserInKrr =
    allUserInKrr.student.length +
    allUserInKrr.staff.length +
    allUserInKrr.admin.length;
  const numOfAllUserOutKrr =
    allUserOutKrr.student.length +
    allUserOutKrr.staff.length +
    allUserOutKrr.admin.length;

  const result = {
    inAndOutKrr: {
      user: {
        student:
          allUserData.student.length != 0
            ? allUserData.student.filter((student) => {
                return {
                  id: student.id,
                  username: student.username,
                  emale: student.email,
                  role: student.role,
                  inKRR: student.inKRR,
                  enable: student.enable,
                  ticket: student.ticket,
                  studentInfo: student.studentInfo,
                };
              })
            : "no data",
        staff: allUserData.staff.length != 0 ? allUserData.staff : "no data",
        admin: allUserData.admin.length != 0 ? allUserData.admin : "no data",
      },
    },
    inKrr: {
      percentage: calculatePercatage(numOfAllUserEnable, numOfAllUserInKrr),
      user: {
        student:
          allUserInKrr.student.length != 0 ? allUserInKrr.student : "no data",
        staff: allUserInKrr.staff.length != 0 ? allUserInKrr.staff : "no data",
        admin: allUserInKrr.admin.length != 0 ? allUserInKrr.admin : "no data",
      },
    },
    outKrr: {
      percentage: calculatePercatage(numOfAllUserEnable, numOfAllUserOutKrr),
      user: {
        student:
          allUserOutKrr.student.length != 0 ? allUserOutKrr.student : "no data",
        staff:
          allUserOutKrr.staff.length != 0 ? allUserOutKrr.staff : "no data",
        admin:
          allUserOutKrr.admin.length != 0 ? allUserOutKrr.admin : "no data",
      },
    },
  };
  return result;
}

//  getALl student by DepartmentName:
async function getAllStudentByDepartmentNameService(departmentName: string) {
  const data = await prisma.user.findMany({
    where: {
      studentInfo: {
        batch: {
          department: departmentName.toUpperCase() as DepartmentEnum,
        },
      },
    },
    select: selectStudentDefault,
    orderBy: {
      username: "asc",
    },
  });

  return data;
}

async function getPaginatedAllStudentByDepartmentNameService(
  departmentName: string,
  limit: number,
  page: number
) {
  const data = await prisma.user.findMany({
    take: limit,
    skip: (page - 1) * limit,
    where: {
      studentInfo: {
        batch: {
          department: departmentName.toUpperCase() as DepartmentEnum,
        },
      },
    },
    select: selectStudentDefault,
    orderBy: {
      username: "asc",
    },
  });

  const total = await prisma.user.count({
    where: {
      studentInfo: {
        batch: {
          department: departmentName.toUpperCase() as DepartmentEnum,
        },
      },
    },
  });
  const pages = Math.ceil(total / limit);
  if (page > pages)
    throw new CustomError(400, `Sorry, maximum page is ${pages}`);

  return {
    pagination: {
      totalData: total,
      totalPages: pages,
      dataPerPage: limit,
      currentPage: page,
    },
    data: data,
  };
}

// get students by departmentName and batch
async function getStudentByDepartmentNameAndBatchNumberService(
  departmentName: string,
  batchNum: number
) {
  const data = await prisma.user.findMany({
    where: {
      studentInfo: {
        batch: {
          AND: [
            { department: departmentName.toUpperCase() as DepartmentEnum },
            { batchNum: batchNum },
          ],
        },
      },
    },
    select: selectStudentDefault,
    orderBy: {
      username: "asc",
    },
  });
  return data;
}

async function getPaginatedStudentByDepartmentNameAndBatchNumberService(
  departmentName: string,
  batchNum: number,
  limit: number,
  page: number
) {
  const data = await prisma.user.findMany({
    take: limit,
    skip: (page - 1) * limit,
    where: {
      studentInfo: {
        batch: {
          AND: [
            { department: departmentName.toUpperCase() as DepartmentEnum },
            { batchNum: batchNum },
          ],
        },
      },
    },
    select: selectStudentDefault,
    orderBy: {
      username: "asc",
    },
  });
  const total = await prisma.user.count({
    where: {
      studentInfo: {
        batch: {
          AND: [
            { department: departmentName.toUpperCase() as DepartmentEnum },
            { batchNum: batchNum },
          ],
        },
      },
    },
  });
  const pages = Math.ceil(total / limit);
  if (page > pages)
    throw new CustomError(400, `Sorry, maximum page is ${pages}`);
  return {
    pagination: {
      totalData: total,
      totalPages: pages,
      dataPerPage: limit,
      currentPage: page,
    },
    data: data,
  };
}
export default {
  getAllUserService,
  getAllStudentByDepartmentNameService,
  getPaginatedAllStudentByDepartmentNameService,
  getStudentByDepartmentNameAndBatchNumberService,
  getPaginatedStudentByDepartmentNameAndBatchNumberService,
};
