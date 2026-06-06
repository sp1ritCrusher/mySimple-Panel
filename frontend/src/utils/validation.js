export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=(?:.*\d){4,})(?=.*[A-Za-z]).{8,}$/;
export const phoneRegex = /^[0-9]{10,11}$/;

export function isValidEmail(value) {
  return emailRegex.test(value.trim());
}

export function isValidPassword(value) {
  return passwordRegex.test(value.trim());
}

export function isValidName(value) {
  return value.trim().length >= 6 && !value.includes(" ");
}

export function isValidPhone(value) {
  return phoneRegex.test(value.trim());
}

export function isValidProduct({ name, description, price, amount }) {
  const priceNum = Number(price);
  const amountNum = Number(amount);
  return (
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    !Number.isNaN(priceNum) &&
    priceNum >= 0 &&
    !Number.isNaN(amountNum) &&
    amountNum >= 0
  );
}
