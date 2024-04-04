import {
  Booking,
  BookingStatusEnum,
  DepartmentEnum,
  PrismaClient,
} from "@prisma/client";
const fs = require("fs");
const downloadsFolder = require("downloads-folder");
import waitingService from "../waiting/waiting.service";
import excelJS, { Fill, Workbook } from "exceljs";
import { CustomError } from "../../handler/customError";
import { get } from "http";
import { BookingDto } from "../../payload/request/bookingDto";
import schedule from "../schedule";
const prisma = new PrismaClient();

const selectBookingDefault = {
  id: true,
  payStatus: true,
  status: true,
  schedule: {
    select: {
      id: true,
      date: true,
      departure: {
        select: {
          id: true,
          departureTime: true,
          from: {
            select: {
              id: true,
              mainLocationName: true,
            },
          },
          destination: {
            select: {
              id: true,
              mainLocationName: true,
            },
          },
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      phone: true,
      gender: true,
      inKRR: true,
      enable: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};

const selectWaitingDefault = {
  id: true,
  payStatus: true,
  status: true,
  schedule: {
    select: {
      id: true,
      date: true,
      departure: {
        select: {
          id: true,
          departureTime: true,
          from: {
            select: {
              id: true,
              mainLocationName: true,
            },
          },
          destination: {
            select: {
              id: true,
              mainLocationName: true,
            },
          },
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      phone: true,
      gender: true,
      inKRR: true,
      enable: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};

// check whatever user is booking with this schedule or not: if user exist in booking with this scheduleId -> user cant book
async function checkExistingBooking(userId: string, scheduleId: string) {
  return await prisma.booking.findUnique({
    where: {
      userId_scheduleId: {
        userId,
        scheduleId,
      },
    },
  });
}
// check wahtever user is in waiting list already or not: if user in waiting -> user cant book
async function checkExistingWaiting(userId: string, scheduleId: string) {
  return await prisma.waitting.findUnique({
    where: {
      userId_scheduleId: {
        userId,
        scheduleId,
      },
    },
  });
}

async function createBookingService(book: Booking) {
  // check ticket:
  const userId = book.userId;
  const getTicketsbyUserId = await prisma.ticket.findUnique({
    where: { userId: userId },
  });

  let maxNumberOfTicket = 36;
  if (getTicketsbyUserId && getTicketsbyUserId.remainTicket <= 0) {
    throw new CustomError(
      400,
      `You can't book anymore, you have used all your ticket ${maxNumberOfTicket}`
    );
  }

  // check available schedule:
  const getScheduleByBookingId = await prisma.schedule.findUnique({
    where: {
      id: book.scheduleId,
    },
  });
  if (!getScheduleByBookingId) {
    throw new CustomError(404, "Schedule not found");
  } else if (getScheduleByBookingId && !getScheduleByBookingId.enable) {
    throw new CustomError(400, "This schedule is already closed");
  }

  // check user have booking already or not:
  const existingBooking = await checkExistingBooking(
    book.userId,
    book.scheduleId
  );

  if (existingBooking) {
    throw new CustomError(
      409,
      "your booking with this schedule is already exist in booking list"
    );
  }
  // check user in waiting already or not:
  const existingWaiting = await checkExistingWaiting(
    book.userId,
    book.scheduleId
  );
  if (existingWaiting) {
    throw new CustomError(
      409,
      "your booking with this schedule is already exist in waiting list"
    );
  }
  // check number of booking of userId
  const isExisted = await prisma.booking.findMany({
    where: {
      AND: [{ userId: book.userId }, { status: "BOOKED" }], // I put "USED" becasue when admin validate --> USED and if admin nvalidate and this user come and book again
    },
  });

  // check number of waiting of userId
  const isWaitting = await prisma.waitting.findMany({
    where: {
      AND: [{ userId: book.userId }, { status: "WAITING" }],
    },
  });

  // find number of booking for schedule
  const bookedAmountFromScheduleId = await prisma.booking.findMany({
    where: {
      AND: [
        { scheduleId: book.scheduleId },
        { status: { in: ["BOOKED", "USED"] } },
      ],
    },
  });
  // easy to make change number ticket inHand
  let maxTicketInhand = 2;
  let defaultNumberOfSeat = 24;
  // number of seat for each departure
  const numOfSeat =
    getScheduleByBookingId?.availableSeat || defaultNumberOfSeat;
  if (getTicketsbyUserId!.ticketLimitInhand < maxTicketInhand) {
    console.log("isExisted.length :", isExisted);
    console.log("isWaitting.length:", isWaitting);

    console.log(
      "isExisted.length + isWaitting.length >= maxTicketInhand:",
      isExisted.length + isWaitting.length
    );

    if (isExisted.length + isWaitting.length >= maxTicketInhand) {
      throw new CustomError(
        400,
        `You can't book more than ${maxTicketInhand} tickets inhand`
      );
    } else {
      await prisma.ticket.update({
        where: { userId: book.userId },
        data: {
          remainTicket: getTicketsbyUserId!.remainTicket - 1,
          ticketLimitInhand: getTicketsbyUserId!.ticketLimitInhand + 1,
        },
      });
      if (bookedAmountFromScheduleId.length >= numOfSeat) {
        const waitingUser = await prisma.waitting.create({
          data: {
            userId: book.userId,
            scheduleId: book.scheduleId,
            updatedAt: null,
          },
          select: selectWaitingDefault,
        });
        return waitingUser;
      } else {
        book.updatedAt = null;
        const userBooking = await prisma.booking.create({
          data: book,
          select: selectBookingDefault,
        });
        return userBooking;
      }
    }
  } else {
    throw new CustomError(
      400,
      `You have used all the tickets in hand, which is ${maxTicketInhand} tickets`
    );
  }
}

// done
async function getAllBookingService() {
  const bookingData = await prisma.booking.findMany({
    select: selectBookingDefault,
    orderBy: {
      createdAt: "desc",
    },
  });
  return bookingData;
}

async function getAllBookingPaginatedService(limit: number, page: number) {
  const total = await prisma.booking.count();
  const pages = Math.ceil(total / limit);
  if (page > pages) {
    throw new CustomError(400, `Sorry maximum page is ${pages}`);
  }

  const res = await prisma.booking.findMany({
    take: limit,
    skip: (page - 1) * limit,
    select: selectBookingDefault,
    orderBy: {
      createdAt: "desc",
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
async function getBookingByIdService(id: string) {
  const bookingUser = await prisma.booking.findUnique({
    where: {
      id: id,
    },
    select: selectBookingDefault,
  });

  return bookingUser;
}
// done
async function swapBookingService(
  fromBookedId: string,
  withWaitingId: string,
  scheduleId: string
) {
  // check swaping must have same scheduleId(same direction)
  const scheduleOfBooking = await prisma.booking.findUnique({
    where: {
      id: fromBookedId,
    },
  });
  const scheduleOfWaiting = await prisma.waitting.findUnique({
    where: {
      id: withWaitingId,
    },
  });
  if (scheduleOfBooking?.scheduleId !== scheduleOfWaiting?.scheduleId) {
    throw new CustomError(400, `Both users must have the same scheduleId`);
  }
  if (
    scheduleOfBooking?.scheduleId !== scheduleId ||
    scheduleOfWaiting?.scheduleId !== scheduleId
  ) {
    throw new CustomError(
      400,
      `user1 and user2 must have scheduleId match with scheduleId(param)`
    );
  }

  const bookingInSchedule = await getBookingByScheduleIdService(scheduleId);
  const waitingInSchedule = await waitingService.getWaitingByScheduleIdService(
    scheduleId
  );

  const isExistInBooking = (await bookingInSchedule).filter(
    (book) => book.id === fromBookedId
  );
  const isExistInWaiting = (await waitingInSchedule).filter(
    (book: { id: string }) => book.id === withWaitingId
  );

  await prisma.booking.delete({
    where: {
      id: isExistInBooking[0].id,
    },
  });
  const getTicketsbyUserId = await prisma.ticket.findUnique({
    where: { userId: isExistInBooking[0].user.id },
  });
  await prisma.ticket.update({
    where: { userId: isExistInBooking[0].user.id },
    data: {
      remainTicket: getTicketsbyUserId!.remainTicket + 1,
      ticketLimitInhand:
        getTicketsbyUserId!.ticketLimitInhand <= 0
          ? 0
          : getTicketsbyUserId!.ticketLimitInhand - 1,
    },
  });
  await prisma.waitting.delete({
    where: {
      id: isExistInWaiting[0].id,
    },
  });
  const newBookingUser = await prisma.booking.create({
    data: {
      userId: isExistInWaiting![0].user.id,
      scheduleId: isExistInWaiting![0].schedule.id,
      payStatus: true,
      status: "BOOKED",
    },
    select: selectBookingDefault,
  });
  return newBookingUser;
}
// done
async function cancelBookingOrWaitingService(id: string) {
  const isExistInBooking = await prisma.booking.findUnique({
    where: { id },
  });

  const isExistInWaiting = await prisma.waitting.findUnique({
    where: { id },
  });

  const userId = isExistInBooking
    ? isExistInBooking.userId
    : isExistInWaiting?.userId;
  const scheduleId = isExistInBooking
    ? isExistInBooking.scheduleId
    : isExistInWaiting?.scheduleId;
  // --creare cancel user:
  await prisma.cancel.create({
    data: {
      userId: userId || "",
      scheduleId: scheduleId || "",
    },
  });

  // get current ticker of user
  const currentTicketInfo = await prisma.ticket.findUnique({
    where: { userId: userId },
  });

  // refun ticket to user:
  await prisma.ticket.update({
    where: { userId },
    data: {
      remainTicket: currentTicketInfo!.remainTicket + 1,
      ticketLimitInhand:
        currentTicketInfo!.ticketLimitInhand > 0
          ? currentTicketInfo!.ticketLimitInhand - 1
          : 0,
    },
  });

  // if user is in booking list
  if (isExistInBooking) {
    // --delete user from booking list
    const userDeleteFromBooking = await prisma.booking.delete({
      where: { id },
      select: selectBookingDefault,
    });

    // -get first user in waiting list
    const getFirstBookedInWaiting = await prisma.waitting.findFirst({
      where: {
        scheduleId,
      },
    });

    // -if waiting list is not empty: 1. delete from booking and 2.create new booking user
    if (getFirstBookedInWaiting) {
      await prisma.waitting.delete({
        where: { id: getFirstBookedInWaiting!.id },
        select: selectWaitingDefault,
      });

      await prisma.booking.create({
        data: {
          userId: getFirstBookedInWaiting!.userId,
          scheduleId: getFirstBookedInWaiting!.scheduleId,
          payStatus: true,
          status: "BOOKED",
        },
      });
    }

    // -if waiting list is empty: then just return
    return userDeleteFromBooking;
  }

  // if user is in Waiting list
  else if (isExistInWaiting) {
    return await prisma.waitting.delete({
      where: { id },
      select: selectWaitingDefault,
    });
  }
}
// done
async function getBookingByScheduleIdService(id: string) {
  const bookingList = await prisma.booking.findMany({
    where: {
      scheduleId: id,
    },
    select: selectBookingDefault,
    orderBy: {
      createdAt: "asc",
    },
  });
  return bookingList;
}

async function getBookingByScheduleIdPaginatedService(
  id: string,
  litmit: number,
  page: number
) {
  const total = await prisma.booking.count();
  const pages = Math.ceil(total / litmit);
  if (page > pages) {
    throw new CustomError(400, `Sorry maximum page is ${pages}`);
  }
  const res = await prisma.booking.findMany({
    take: litmit,
    skip: (page - 1) * litmit,
    where: {
      // AND: [{ scheduleId: id }, { status: "BOOKED" }],
      scheduleId: id,
    },
    select: selectBookingDefault,
    orderBy: {
      createdAt: "asc",
    },
  });
  return {
    pagination: {
      totalData: total,
      totalPage: pages,
      dataPerPage: litmit,
      currentPage: page,
    },
    data: res,
  };
}

// service: generate booking by Schedule Id
async function exportExcelBookingByScheduleIdService(id: string) {
  // const data = bookingService.getBookingByScheduleId(id)
  const workbook = new excelJS.Workbook();
  const allUser = await prisma.booking.findMany({
    where: {
      scheduleId: id,
      status: {
        in: ["BOOKED", "USED"],
      },
    },
    select: {
      id: true,
      user: {
        include: {
          studentInfo: {
            include: {
              batch: true,
            },
          },
        },
      },
      schedule: {
        select: {
          date: true,
          departure: {
            select: {
              id: true,
              departureTime: true,
              from: {
                select: {
                  id: true,
                  mainLocationName: true,
                },
              },
              destination: {
                select: {
                  id: true,
                  mainLocationName: true,
                },
              },
            },
          },
        },
      },
      status: true,
    },
  });
  const scheduleDetail = await prisma.schedule.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      date: true,
      departure: {
        select: {
          id: true,
          departureTime: true,
          from: {
            select: {
              id: true,
              mainLocationName: true,
            },
          },
          destination: {
            select: {
              id: true,
              mainLocationName: true,
            },
          },
        },
      },
    },
  });

  console.log(allUser);

  // sheet name
  const worksheet = workbook.addWorksheet(
    `${scheduleDetail?.departure.from.mainLocationName} - ${scheduleDetail?.departure.destination.mainLocationName}`
  );

  if (!allUser || allUser.length == 0) {
    throw new CustomError(204, "no date to export");
  }

  // const path = "C:/Users/Seanghor/Downloads/";
  const path_down = downloadsFolder();
  console.log("File download into Path:", path_down);

  // Column for data in excel. key must match data key
  worksheet.columns = [
    {
      header: "No",
      key: "index",
      width: 10,
    },
    {
      header: "Username",
      key: "username",
      width: 20,
    },
    {
      header: "Gender",
      key: "gender",
      width: 20,
    },
    {
      header: "Department",
      key: "department",
      width: 20,
    },
    {
      header: "Batch",
      key: "batchNum",
      width: 20,
    },
    {
      header: "Email",
      key: "email",
      width: 30,
    },
    {
      header: "Role",
      key: "role",
      width: 20,
    },
    {
      header: "Departure Date",
      key: "departureDate",
      width: 20,
    },
    {
      header: "From/To",
      key: "from_to",
      width: 20,
    },
    {
      header: "Phone",
      key: "phone",
      width: 20,
    },
    {
      header: "DepartureTime",
      key: "departureTime",
      width: 20,
    },
  ];

  // Looping through user data:
  let index = 1;
  allUser.forEach((user) => {
    const userData = {
      index: index,
      username: user.user.username,
      email: user.user.email,
      phone: user.user.phone === null ? "N/A" : user.user.phone,
      gender: user.user.gender,
      department:
        user.user.role != "STUDENT"
          ? "N/A"
          : user.user.studentInfo?.batch?.department,
      batchNum:
        user.user.role != "STUDENT"
          ? "N/A"
          : user.user.studentInfo?.batch?.batchNum,
      role: user.user.role,
      departureDate: user.schedule.date,
      from_to: `${user.schedule.departure.from.mainLocationName} > ${user.schedule.departure.destination.mainLocationName}`,
      departureTime: user.schedule.departure.departureTime.toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      ),
    };
    worksheet.addRow(userData); // add data in row
    index++;
  });

  worksheet.getColumn("A").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getColumn("B").alignment = {
    vertical: "middle",
    horizontal: "left",
  };
  worksheet.getColumn("C").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getColumn("D").alignment = {
    vertical: "middle",
    horizontal: "left",
  };
  worksheet.getColumn("E").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getColumn("F").alignment = {
    vertical: "middle",
    horizontal: "left",
  };
  worksheet.getColumn("G").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getColumn("H").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getColumn("I").alignment = {
    vertical: "middle",
    horizontal: "left",
  };
  worksheet.getColumn("J").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getColumn("K").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  // Making first line in excel bold
  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "E0E0E0" },
    };
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  worksheet.getRow(1).height = 25;
  worksheet.columns.forEach((column: any) => {
    column.header === "No" || column.header === "Gender"
      ? (column.width = 12)
      : column.header === "From/To" || column.header === "Email"
      ? (column.width = 30)
      : (column.width = 25);
  });

  // -- note for write name file
  // filename= `ShuttleBus-${scheduleDetail?.date
  //   .toISOString()
  //   .substring(0, 10)}-${scheduleDetail?.departure.from.mainLocationName
  // }-to-${scheduleDetail?.departure.destination.mainLocationName}`
  // Save the workbook to a buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
// done
// service: generate booking by Date: "yy-mm-dd"
async function exportExcelBookingByDateService(date: Date) {
  const allSchedule = await prisma.schedule.findMany({
    where: {
      date: new Date(date),
    },
    select: {
      id: true,
      date: true,
      departureId: true,
      departure: {
        select: {
          departureTime: true,
          from: {
            select: {
              id: true,
              mainLocationName: true,
            },
          },
          destination: {
            select: {
              id: true,
              mainLocationName: true,
            },
          },
        },
      },
      booking: {
        select: {
          id: true,
          user: {
            include: {
              studentInfo: {
                select: {
                  batch: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // sheet name
  const workbook = new excelJS.Workbook();
  const path_down = downloadsFolder();
  console.log("File download into Path:", path_down);

  // check if departure of the date have no booking, then we don't create sheet when generate
  const allScheduleHaveBooking = allSchedule.filter(
    (data) => data.booking.length != 0
  );

  if (!allScheduleHaveBooking || allScheduleHaveBooking.length == 0) {
    throw new CustomError(204, "no date for export");
  }
  allScheduleHaveBooking.forEach((eachSchedule) => {
    let from = eachSchedule.departure.from.mainLocationName;
    let destination = eachSchedule.departure.destination.mainLocationName;
    const worksheet = workbook.addWorksheet(`${from} - ${destination}`);

    // Column for data in excel. key must match data key
    worksheet.columns = [
      {
        header: "No",
        key: "index",
        width: 10,
      },
      {
        header: "Username",
        key: "username",
        width: 20,
      },
      {
        header: "Gender",
        key: "gender",
        width: 20,
      },
      {
        header: "Department",
        key: "department",
        width: 20,
      },
      {
        header: "Batch",
        key: "batchNum",
        width: 20,
      },
      {
        header: "Email",
        key: "email",
        width: 30,
      },
      {
        header: "Role",
        key: "role",
        width: 20,
      },
      {
        header: "Departure Date",
        key: "departureDate",
        width: 20,
      },
      {
        header: "From/To",
        key: "from_to",
        width: 20,
      },
      {
        header: "Phone",
        key: "phone",
        width: 20,
      },
      {
        header: "DepartureTime",
        key: "departureTime",
        width: 20,
      },
    ];

    // Looping through user data:
    let index = 1;
    eachSchedule.booking.forEach((user) => {
      const userData = {
        index: index,
        username: user.user.username,
        email: user.user.email,
        phone: user.user.phone,
        gender: user.user.gender,
        department:
          user.user.role != "STUDENT"
            ? "N/A"
            : user.user.studentInfo?.batch?.department,
        batchNum:
          user.user.role != "STUDENT"
            ? "N/A"
            : user.user.studentInfo?.batch?.batchNum,
        role: user.user.role,
        departureDate: eachSchedule.date,
        from_to: `${from} > ${destination}`,
        departureTime: eachSchedule.departure.departureTime.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
      };
      worksheet.addRow(userData); // add data in row
      index++;
    });

    // Making first line in excel bold
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
  });

  return await workbook.xlsx.writeFile(
    `${path_down}/booking/ShuttleBus-${date
      .toISOString()
      .substring(0, 10)}.xlsx`
  );
}
// done
// service: get booking and waiting filter by date
async function getAllBookingAndWaitingFilterByDateService(date: Date) {
  const userListBooking = await prisma.booking.findMany({
    where: {
      schedule: {
        date: new Date(date),
      },
    },
    select: selectBookingDefault,
    orderBy: {
      createdAt: "asc",
    },
  });

  const userListWaiting = await prisma.waitting.findMany({
    where: {
      schedule: {
        date: new Date(date),
      },
    },
    select: selectWaitingDefault,
    orderBy: {
      createdAt: "asc",
    },
  });

  const users = {
    booking: userListBooking,
    waiting: userListWaiting,
  };
  return users;
}

// done
// service: get booking by batch(department and batchnumber) and date
async function getBookingAndWaitingFilterByDepartmentBatchAndDateService(
  department: DepartmentEnum,
  batchNum: number,
  date: Date
) {
  // check department and batchNum exist:
  const existingBatch = await prisma.batch.findUnique({
    where: {
      department_batchNum: {
        department,
        batchNum,
      },
    },
  });
  if (!existingBatch) {
    throw new CustomError(204, `department and batch number is not exist`);
  }

  // check date exist:
  const existingDateOfSchedule = await prisma.schedule.findFirst({
    where: {
      date: new Date(date),
    },
  });
  if (!existingDateOfSchedule) {
    throw new CustomError(204, `date is not exist on schedule`);
  }

  // query date Booking:
  const bookingList = await prisma.booking.findMany({
    where: {
      AND: [
        {
          schedule: {
            date: new Date(date),
          },
        },
        {
          user: {
            studentInfo: {
              batch: {
                AND: [
                  { department: department as DepartmentEnum },
                  { batchNum: batchNum },
                ],
              },
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
    select: selectBookingDefault,
  });

  // query date Waiting:
  const waitingList = await prisma.waitting.findMany({
    where: {
      AND: [
        {
          schedule: {
            date: new Date(date),
          },
        },
        {
          user: {
            studentInfo: {
              batch: {
                AND: [
                  { department: department as DepartmentEnum },
                  { batchNum: batchNum },
                ],
              },
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
    select: selectBookingDefault,
  });

  const dataUsers = {
    booking: bookingList,
    waiting: waitingList,
  };
  return dataUsers;
}
// done
// service: get booking by date, departmentName
async function getAllBookingAndWaitingByDateAndDepartmentService(
  date: Date,
  department: DepartmentEnum
) {
  // check date is exist:
  const existingDateOfSchedule = await prisma.schedule.findMany({
    where: {
      date: new Date(date),
    },
  });
  console.log(existingDateOfSchedule);

  if (existingDateOfSchedule.length === 0) {
    throw new CustomError(404, `date is not exist on schedule`);
  }
  const bookingList = await prisma.booking.findMany({
    where: {
      AND: [
        {
          schedule: {
            date: new Date(date),
          },
        },
        {
          user: {
            studentInfo: {
              batch: {
                department: department as DepartmentEnum,
              },
            },
          },
        },
      ],
    },
    select: selectBookingDefault,
    orderBy: {
      createdAt: "asc",
    },
  });
  const waitingList = await prisma.waitting.findMany({
    where: {
      schedule: {
        date: new Date(date),
      },
      user: {
        studentInfo: {
          batch: {
            department: department as DepartmentEnum,
          },
        },
      },
    },
    select: selectBookingDefault,
    orderBy: {
      createdAt: "asc",
    },
  });

  const dataUsers = {
    booking: bookingList,
    waiting: waitingList,
  };
  return dataUsers;
}
async function getAllBookingByUserIdService(userId: string) {
  const bookingList = await prisma.booking.findMany({
    where: {
      userId: userId,
      status: BookingStatusEnum.BOOKED,
    },
    select: {
      id: true,
      status: true,
      schedule: {
        select: {
          id: true,
          date: true,
          departure: {
            select: {
              id: true,
              from: true,
              destination: true,
              dropLocation: true,
              departureTime: true,
              pickupLocation: true,
            },
          },
          bus: {
            select: {
              id: true,
              model: true,
              plateNumber: true,
              numOfSeat: true,
              driverName: true,
              driverContact: true,
            },
          },
        },
      },

      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return bookingList;
}

async function getAllPaginatedBookingByUserIdService(
  userId: string,
  limit: number,
  page: number
) {
  const res = await prisma.booking.findMany({
    take: limit,
    skip: (page - 1) * limit,
    where: {
      userId: userId,
      status: BookingStatusEnum.BOOKED,
    },
    select: {
      id: true,
      status: true,
      schedule: {
        select: {
          id: true,
          date: true,
          departure: {
            select: {
              id: true,
              from: true,
              destination: true,
              dropLocation: true,
              departureTime: true,
              pickupLocation: true,
            },
          },
          bus: {
            select: {
              id: true,
              model: true,
              plateNumber: true,
              numOfSeat: true,
              driverName: true,
              driverContact: true,
            },
          },
        },
      },

      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  const total = await prisma.booking.count({
    where: {
      userId: userId,
      status: BookingStatusEnum.BOOKED,
    },
  });
  const pages = Math.ceil(total / limit);
  if (page > pages) {
    throw new CustomError(400, `Sorry maximum page is ${pages}`);
  }
  return {
    pagination: {
      totalData: total,
      totalPages: pages,
      dataPerPage: limit,
      currentPage: page,
    },
    data: res,
  };
}
async function getAllBookingHistoryByUserIdService(id: string) {
  return await prisma.booking.findMany({
    where: {
      userId: id,
      status: BookingStatusEnum.USED,
    },
    select: {
      id: true,
      status: true,
      schedule: {
        select: {
          id: true,
          date: true,
          departure: {
            select: {
              id: true,
              from: true,
              destination: true,
              dropLocation: true,
              departureTime: true,
              pickupLocation: true,
            },
          },
          bus: {
            select: {
              id: true,
              model: true,
              plateNumber: true,
              numOfSeat: true,
              driverName: true,
              driverContact: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getAllPaginatedBookingHistoryByUserIdService(
  id: string,
  limit: number,
  page: number
) {
  const res = await prisma.booking.findMany({
    take: limit,
    skip: (page - 1) * limit,
    where: {
      userId: id,
      status: BookingStatusEnum.USED,
    },
    select: {
      id: true,
      status: true,
      schedule: {
        select: {
          id: true,
          date: true,
          departure: {
            select: {
              id: true,
              from: true,
              destination: true,
              dropLocation: true,
              departureTime: true,
              pickupLocation: true,
            },
          },
          bus: {
            select: {
              id: true,
              model: true,
              plateNumber: true,
              numOfSeat: true,
              driverName: true,
              driverContact: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const total = await prisma.booking.count({
    where: {
      userId: id,
      status: BookingStatusEnum.USED,
    },
  });
  const pages = Math.ceil(total / limit);
  if (page > pages) {
    throw new CustomError(400, `Sorry maximum page is ${pages}`);
  }
  return {
    pagination: {
      totalData: total,
      totalPages: pages,
      dataPerPage: limit,
      currentPage: page,
    },
    data: res,
  };
}

export default {
  getAllBookingHistoryByUserIdService,
  getAllPaginatedBookingHistoryByUserIdService,
  createBookingService,
  getAllBookingService,
  getAllBookingPaginatedService,
  getBookingByIdService,
  exportExcelBookingByScheduleIdService,
  exportExcelBookingByDateService,
  cancelBookingOrWaitingService,
  getBookingByScheduleIdService,
  getBookingByScheduleIdPaginatedService,
  swapBookingService,
  getAllBookingAndWaitingFilterByDateService,
  getBookingAndWaitingFilterByDepartmentBatchAndDateService,
  getAllBookingAndWaitingByDateAndDepartmentService,
  getAllBookingByUserIdService,
  getAllPaginatedBookingByUserIdService,
};
