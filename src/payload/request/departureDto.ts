export interface DepartureDto {
  fromId: string;
  destinationId: string;
  departureTime: Date;
  pickupLocationId: string;
  dropLocationId: string;
  createAt: Date | null;
}
