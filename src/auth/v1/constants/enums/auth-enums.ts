export enum REGISTRATION_ENUM {
  SUCCESS = 'Registration Successful. Please verify your account to sign in!',
  REGISTRATION_FAILED = 'User registration failed!',
  PASSWORD_MISMATCH = 'Password must match password confirmation!',
  USERNAME_CONFLICT = 'A user with the same username exists!',
  EMAIL_CONFLICT = 'A user with the same email exists!',
}

export enum AUTH_ENUM {
  INVALID_CREDENTIALS = 'Invalid authentication credentials!',
  UNAUTHORIZED = 'Unauthenticated!',
  PASSWORD_CHANGED_SUCCESS = 'Password changed successfully! Please login to continue!',
  SAME_AS_OLD_PASSWORD = 'Old and new password cannot be the same!',
  CHANGE_PASSWORD_MISMATCH = 'New password and confirmation must match!',
  LOGOUT_SUCCESS = 'Logout successful!',
  OTP_EXPIRED = 'Sorry this OTP has expired. Resend OTP?',
  INVALID_OTP = 'Sorry this OTP is invalid. Resend OTP?',
  OTP_VERIFIED_SUCCESS = 'OTP verified!',
  UNVERIFIED_ACCOUNT = 'Please verify your account to login!',
  LOGIN_SUCCESS = 'Login successful',
}

export enum GENERAL_ERROR {}

export enum OTP_TYPES {
  LOGIN = 'Login',
}
