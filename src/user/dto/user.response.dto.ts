import { User } from "../entity/user.entity";

export class UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends User {}