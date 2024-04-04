import { DepartmentEnum, GenderEnum, RoleEnum } from "@prisma/client";
export interface StaffDto {
  email: string;
  username: string;
  password: string | null;
  googlePassword: string | null;
  phone: string | null;
  role: RoleEnum;
  gender: GenderEnum | null;
  inKRR: Boolean | null;
  updateAt: Date | null;
  department: DepartmentEnum | null;
  batchNum: number | null;
  enable: Boolean | false;
}
