export interface UserSchemaInterface {
  username: string;

  email: string;

  password: string;

  requiresLogin: boolean;

  isAdmin: boolean;

  isVerified: boolean;

  otp: string | null;

  otpType: string;

  otpStatus: boolean;

  otpExpiry: Date;

  isSuperAdmin: boolean;

  createdAt: Date;

  updatedAt: Date;
}
