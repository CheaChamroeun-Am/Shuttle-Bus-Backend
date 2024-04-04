import { DepartmentEnum, PrismaClient, RoleEnum } from "@prisma/client";
import { CustomError } from "../../handler/customError";
const prisma = new PrismaClient();
async function refillAllUser(
  type: string,
  batchNum: number,
  include: boolean,
  amount: number,
  department: string
) {
  var userCondition = {};
  var ticketCondition = 0;
  if (type.toUpperCase() === "ALL") {
    userCondition = { enable: true };
  }
  if (type.toUpperCase() === "BATCH") {
    if (batchNum == null || batchNum == 0) {
      userCondition = {
        AND: [
          { enable: true },
          { role: RoleEnum.STUDENT },
          {
            studentInfo: {
              batch: { department: department as DepartmentEnum },
            },
          },
        ],
      };
    } else {
      userCondition = {
        AND: [
          { enable: true },
          { studentInfo: { batch: { batchNum: batchNum } } },
        ],
      };
    }
  }
  if (type.toUpperCase() === "STAFF") {
    userCondition = { AND: [{ enable: true }, { role: RoleEnum.STAFF }] };
  }
  console.log(userCondition);

  const data = await prisma.user.findMany({
    where: userCondition,
    select: {
      id: true,
      ticket: {
        select: {
          remainTicket: true,
        },
      },
    },
  });
  for (var item of data) {
    //get remain ticket
    const remain = item.ticket?.remainTicket ?? 0;
    //check if include remain ticket
    ticketCondition = include == true ? amount + remain : amount;

    //update remain ticket
    await prisma.ticket.updateMany({
      where: { userId: item.id },
      data: {
        remainTicket: ticketCondition > 36 ? 36 : ticketCondition,
      },
    });
  }
  return;
}

async function refillTicketAllUser(amount: number, include: boolean) {
  var ticketCondition = 0;

  const data = await prisma.user.findMany({
    where: { enable: true },
    select: {
      id: true,
      ticket: {
        select: {
          remainTicket: true,
        },
      },
    },
  });
  for (var item of data) {
    //get remain ticket
    const remain = item.ticket?.remainTicket ?? 0;
    //check if include remain ticket
    ticketCondition = include == true ? amount + remain : amount;

    //update remain ticket
    await prisma.ticket.updateMany({
      where: { userId: item.id },
      data: {
        remainTicket: ticketCondition > 36 ? 36 : ticketCondition,
      },
    });
  }
  return;
}

async function refillTicketWithDepartmentAndBatch(
  batchNum: number,
  include: boolean,
  amount: number,
  department: string
) {
  var ticketCondition = 0;
  const userCondition = {
    AND: [
      { role: RoleEnum.STUDENT },
      { enable: true },
      {
        studentInfo: {
          batch: {
            batchNum: batchNum,
            department: department as DepartmentEnum,
          },
        },
      },
    ],
  };
  console.log("userCondition:", JSON.stringify(userCondition));

  const data = await prisma.user.findMany({
    where: userCondition,
    select: {
      id: true,
      ticket: {
        select: {
          remainTicket: true,
        },
      },
    },
  });
  for (var item of data) {
    //get remain ticket
    const remain = item.ticket?.remainTicket ?? 0;
    //check if include remain ticket
    ticketCondition = include == true ? amount + remain : amount;

    //update remain ticket
    await prisma.ticket.updateMany({
      where: { userId: item.id },
      data: {
        remainTicket: ticketCondition > 36 ? 36 : ticketCondition,
      },
    });
  }
  return;
}

async function refillTicketWithDepartment(
  include: boolean,
  amount: number,
  department: DepartmentEnum
) {
  var ticketCondition = 0;
  const userCondition = {
    AND: [
      { enable: true },
      { role: RoleEnum.STUDENT },
      {
        studentInfo: {
          batch: { department: department as DepartmentEnum },
        },
      },
    ],
  };
  console.log("userCondition:", JSON.stringify(userCondition));

  const data = await prisma.user.findMany({
    where: userCondition,
    select: {
      id: true,
      ticket: {
        select: {
          remainTicket: true,
        },
      },
    },
  });
  console.log(data);

  for (var item of data) {
    //get remain ticket
    const remain = item.ticket?.remainTicket ?? 0;
    //check if include remain ticket
    ticketCondition = include == true ? amount + remain : amount;

    //update remain ticket
    await prisma.ticket.updateMany({
      where: { userId: item.id },
      data: {
        remainTicket: ticketCondition > 36 ? 36 : ticketCondition,
      },
    });
  }
  return;
}
async function refillTicketAllUserWithRole(
  role: RoleEnum,
  amount: number,
  include: boolean
) {
  var ticketCondition = 0;
  const userCondition = {
    AND: [{ enable: true }, { role: role as RoleEnum }],
  };
  console.log("userCondition:", JSON.stringify(userCondition));

  const data = await prisma.user.findMany({
    where: userCondition,
    select: {
      id: true,
      ticket: {
        select: {
          remainTicket: true,
        },
      },
    },
  });
  console.log(data);

  for (var item of data) {
    //get remain ticket
    const remain = item.ticket?.remainTicket || 0;

    ticketCondition = include ? amount + remain : amount;

    //update remain ticket
    await prisma.ticket.updateMany({
      where: { userId: item.id },
      data: {
        remainTicket: ticketCondition > 36 ? 36 : ticketCondition,
      },
    });
  }
  return;
}

async function refillParticularUser(
  listUser: string[],
  amount: number,
  include: boolean
) {
  listUser.forEach(async (item) => {
    //check user
    const user = await prisma.user.findUnique({ where: { id: item } });
    if (user == null) {
      throw new CustomError(404, `User not found`);
    }
    //get remain ticket
    const remain =
      (await prisma.ticket.findFirst({ where: { userId: item } }))
        ?.remainTicket ?? 0;
    //check if include remain ticket
    const ticketCondition = include == true ? amount + remain : amount;
    //update remain ticket
    await prisma.ticket.update({
      where: { userId: user.id },
      data: {
        remainTicket: ticketCondition > 36 ? 36 : ticketCondition,
      },
    });
  });
}
export default {
  refillAllUser,
  // ----
  refillTicketAllUser,
  refillTicketAllUserWithRole,
  refillTicketWithDepartment,
  refillTicketWithDepartmentAndBatch,
  refillParticularUser,
};
