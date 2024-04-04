import { DepartmentEnum, GenderEnum, RoleEnum } from "@prisma/client";

export interface AdminDto {
  email: string;
  enable: Boolean | false;
  username: string;
  password: string | null;
  googlePassword: string | null;
  phone: string | null;
  role: RoleEnum;
  gender: GenderEnum | null;
  inKRR: Boolean | false;
  updateAt: Date | null;
  department: DepartmentEnum | null;
  batchNum: number | 0;
}
