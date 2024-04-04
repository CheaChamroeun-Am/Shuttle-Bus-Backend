import * as path from "path";
import { Workbook } from "exceljs";
import { DepartmentEnum, GenderEnum, RoleEnum } from "@prisma/client";
import { CustomError } from "../handler/customError";

interface userProps {
  index: number;
  date: string;
  username: string;
  status: string;
  role: string | RoleEnum;
  gender: string | GenderEnum;
  department: string | DepartmentEnum;
  email: string;
  phone: string;
}
async function downloadExcel(data: userProps[], sheet: string) {
  if (!data) {
    throw new CustomError(400, "No data found");
  }
  const workbook = new Workbook();
  const workSheet = workbook.addWorksheet(sheet);

  workSheet.columns = [
    { header: "No", key: "index", width: 10 },
    { header: "Date", key: "date", width: 20 },
    { header: "Username", key: "username", width: 20 },
    { header: "Status", key: "status", width: 10 },
    { header: "Role", key: "role", width: 20 },
    { header: "Gender", key: "gender", width: 20 },
    { header: "Department", key: "department", width: 20 },
    { header: "Email", key: "email", width: 40 },
    { header: "Phone", key: "phone", width: 20 },
  ];

  // add data to row:
  for (let user of data) {
    workSheet.addRow({
      ...user,
    });
  }

  // ---- styleing
  // index
  const colIndex = workSheet.getColumn(1);
  colIndex.eachCell((cell) => {
    cell.alignment = { horizontal: "center" };
  });

  // Freeze the first row
  workSheet.views = [
    {
      state: "frozen",
      ySplit: 1, // Number of rows to freeze. In this case, we're freezing 1 row.
    },
  ];

  // table:
  // Set up table-style borders for the entire worksheet
  workSheet.eachRow((row, rowNumber) => {
    const statusCell = row.getCell("status");
    row.eachCell((cell) => {
      // Apply cell border styles for the table
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: `${statusCell.value === "Out KRR" ? "#DFDFDF" : "#FFFFFF"}`,
        },
      };
    });
  });

  // header
  const headerRow = workSheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFC000" },
    };
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
  });
  const exportPath = path.resolve(
    __dirname,
    `./file.excel/ShuttleBus-User.xlsx`
  );
  await workbook.xlsx.writeFile(exportPath);
  return exportPath;
}

interface studentProps {
  index: number;
  date: string;
  username: string;
  status: string;
  gender: string | GenderEnum;
  department: string | DepartmentEnum;
  email: string;
  phone: string;
}
async function downloadExcelStudent(data: studentProps[], sheet: string) {
  if (!data) {
    throw new CustomError(400, "No data found");
  }
  const workbook = new Workbook();
  const workSheet = workbook.addWorksheet(sheet);
  workSheet.columns = [
    { header: "No", key: "index", width: 10 },
    { header: "Date", key: "date", width: 20 },
    { header: "Username", key: "username", width: 20 },
    { header: "Status", key: "status", width: 10 },
    { header: "Gender", key: "gender", width: 20 },
    { header: "Department", key: "department", width: 20 },
    { header: "Email", key: "email", width: 40 },
    { header: "Phone", key: "phone", width: 20 },
  ];

  for (let student of data) {
    workSheet.addRow({
      ...student,
    });
  }
  // ---- styleing
  // index
  const colIndex = workSheet.getColumn(1);
  colIndex.eachCell((cell) => {
    cell.alignment = { horizontal: "center" };
  });

  // Freeze the first row
  workSheet.views = [
    {
      state: "frozen",
      ySplit: 1, // Number of rows to freeze. In this case, we're freezing 1 row.
    },
  ];

  // table:
  // Set up table-style borders for the entire worksheet
  workSheet.eachRow((row, rowNumber) => {
    const statusCell = row.getCell("status");
    row.eachCell((cell) => {
      // Apply cell border styles for the table
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: `${statusCell.value === "Out KRR" ? "#DFDFDF" : "#FFFFFF"}`,
        },
      };
    });
  });

  // header
  const headerRow = workSheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFC000" },
    };
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
  });
  const exportPath = path.resolve(
    __dirname,
    `./file.excel/ShuttleBus-User.xlsx`
  );
  await workbook.xlsx.writeFile(exportPath);
  return exportPath;
}

interface staffProps {
  index: number;
  date: string;
  username: string;
  status: string;
  gender: string | GenderEnum;
  email: string;
  phone: string;
}
async function downloadExcelStaff(data: staffProps[], sheet: string) {
  if (!data) {
    throw new CustomError(400, "No data found");
  }
  const workbook = new Workbook();
  const workSheet = workbook.addWorksheet(sheet);
  workSheet.columns = [
    { header: "No", key: "index", width: 10 },
    { header: "Date", key: "date", width: 20 },
    { header: "Username", key: "username", width: 20 },
    { header: "Status", key: "status", width: 10 },
    { header: "Gender", key: "gender", width: 20 },
    { header: "Email", key: "email", width: 40 },
    { header: "Phone", key: "phone", width: 20 },
  ];

  for (let student of data) {
    workSheet.addRow({
      ...student,
    });
  }
  // ---- styleing
  // index
  const colIndex = workSheet.getColumn(1);
  colIndex.eachCell((cell) => {
    cell.alignment = { horizontal: "center" };
  });

  // Freeze the first row
  workSheet.views = [
    {
      state: "frozen",
      ySplit: 1, // Number of rows to freeze. In this case, we're freezing 1 row.
    },
  ];

  // table:
  // Set up table-style borders for the entire worksheet
  workSheet.eachRow((row, rowNumber) => {
    const statusCell = row.getCell("status");
    row.eachCell((cell) => {
      // Apply cell border styles for the table
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: `${statusCell.value === "Out KRR" ? "#DFDFDF" : "#FFFFFF"}`,
        },
      };
    });
  });

  // header
  const headerRow = workSheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFC000" },
    };
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
  });
  const exportPath = path.resolve(
    __dirname,
    `./file.excel/ShuttleBus-User.xlsx`
  );
  await workbook.xlsx.writeFile(exportPath);
  return exportPath;
}

export default {
  downloadExcel,
  downloadExcelStudent,
  downloadExcelStaff,
};
