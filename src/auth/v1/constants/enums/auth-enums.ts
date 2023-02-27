export enum REGISTRATION_ENUM {
  SUCCESS = 'Registration Successful. Please sign in!',
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
}

export enum GENERAL_ERROR {}
