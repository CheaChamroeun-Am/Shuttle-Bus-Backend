import { DepartmentEnum, GenderEnum, RoleEnum } from "@prisma/client";
export interface StudentDto {
  email: string;
  username: string | null;
  password: string | null;
  googlePassword: string | null;
  phone: string | null;
  role: RoleEnum;
  gender: GenderEnum | null;
  inKRR: boolean | null;
  department: DepartmentEnum | null;
  batchNum: number | null;
  updateAt: Date | null;
  enable: Boolean | false;
}
