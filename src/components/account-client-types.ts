export interface AddressDTO {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string | null;
  province: string;
  phone: string;
  isDefault: boolean;
}
