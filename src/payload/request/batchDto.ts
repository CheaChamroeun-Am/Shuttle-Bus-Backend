import { DepartmentEnum } from "@prisma/client";
export interface BatchDto {
  department: DepartmentEnum;
  batchNum: number;
}
