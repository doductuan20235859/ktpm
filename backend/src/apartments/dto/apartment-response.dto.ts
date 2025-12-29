export class ApartmentResponseDto {
  id: number;
  code: string;
  areaSqm: number;
  status: string;
  ownerName: string | null;
  ownerPhone: string | null;
}
