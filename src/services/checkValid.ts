export const checkValidPhoneNumber = (phoneNumber: string) => {
  const phoneRegex = /^0[0-9]{9}$/;
  return phoneRegex.test(phoneNumber);
};

export const checkValidEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailRegex.test(email);
};

export const checkValidLength = (value: string ,expectLength: number) => {
  return value.length <= expectLength; 
}

export const checkValidPassword = (password: string) => {
  return password.length >= 6;
}

export const checkValidGender = (gender: string) => {
  const gender2 = gender.toLocaleLowerCase();
  return (gender2 === "nam" || gender2 === "nữ" || gender2 === "khác")
}