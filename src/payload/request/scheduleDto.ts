import { Bus, MainLocation, SubLocation } from "@prisma/client";
export interface ScheduleDto {
  departureId: string;
  date: Date;
  enable: boolean;
  availableSeat: number | undefined;
  busId: string;
}
export interface ScheduleResponseDto {
  id: string;
  date: string;
  availableSeat: number | null;
  departureId: string;
  enable: boolean;
  departure: {
    id: string;
    departureTime: string;
    from: MainLocation;
    destination: MainLocation;
    pickupLocation: SubLocation;
    dropLocation: SubLocation;
  };
  bus: Bus | null;
}
