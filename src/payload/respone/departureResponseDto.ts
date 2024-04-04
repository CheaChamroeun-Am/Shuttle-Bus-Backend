export interface ResponseDepartureDto {
  id: string;
  departureTime: Date | string;
  date: Date;
  fromLocation: string;
  fromLocationId: string;
  destinationLocation: string;
  destinationLocationId: string;
}
