export interface UserSchemaInterface {
  username: string;

  email: string;

  password: string;

  requiresLogin: boolean;

  createdAt: Date;

  updatedAt: Date;
}
