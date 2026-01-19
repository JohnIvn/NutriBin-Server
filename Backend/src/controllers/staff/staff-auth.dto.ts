export type StaffSignUpDto = {
  firstname: string;
  lastname: string;
  email: string;
  birthday?: string;
  age?: number;
  password: string;
  contact?: string;
  address?: string;
  verificationCode?: string;
};

export type StaffSignInDto = {
  email: string;
  password: string;
};

export type GoogleSignInDto = {
  credential: string;
};
