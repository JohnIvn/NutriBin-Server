export type StaffSignUpDto = {
  fName: string;
  lName: string;
  email: string;
  password: string;
  contactNumber?: string;
  address?: string;
};

export type StaffSignInDto = {
  email: string;
  password: string;
};
