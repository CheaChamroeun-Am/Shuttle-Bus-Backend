import { AdminInfo, RoleEnum, StaffInfo, StudentInfo } from "@prisma/client";
interface Ticket {
  id: string;
  remainTicket: number;
  ticketLimitInhand: number;
  createdAt: any;
  updatedAt: any;
}
export interface StudentDashboardDto {
  id: string;
  username: string | null;
  email: string | null;
  role: RoleEnum;
  inKRR: boolean | null;
  enable: boolean;
  ticket: {
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    remainTicket: number;
    ticketLimitInhand: number;
  } | null;
  studentInfo: StudentInfo | null;
}

export interface AdminDashboardDto {
  id: string;
  username: string | null;
  email: string | null;
  role: RoleEnum;
  inKRR: boolean | false;
  enable: boolean;
  ticket: {
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    remainTicket: number;
    ticketLimitInhand: number;
  } | null;
  adminInfo: AdminInfo | null;
}

export interface StaffDashboardDto {
  id: string;
  username: string | null;
  email: string | null;
  role: RoleEnum;
  inKRR: boolean | null;
  enable: boolean;
  ticket: {
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    remainTicket: number;
    ticketLimitInhand: number;
  } | null;
  staffInfo: StaffInfo | null;
}
