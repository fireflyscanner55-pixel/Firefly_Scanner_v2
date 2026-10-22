export function formatIndianPhoneNumber(
  mobileNumber: string
): string | null {
  const cleanedNumber = mobileNumber.replace(/\D/g, "");

  if (!/^[6-9]\d{9}$/.test(cleanedNumber)) {
    return null;
  }

  return `+91${cleanedNumber}`;
}