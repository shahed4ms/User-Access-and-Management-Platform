export type UserRole = 'General User' | 'Admin';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: string;
  accessLevel: string;
}

export interface LoginRequest {
  userId: string;
  password: string;
  role: UserRole;
}

export interface UserRecord {
  id: string;
  title: string;
  type: string;
  owner: string;
  status: string;
  amount: number;
  access: string;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface UsersResponse {
  success: boolean;
  users: User[];
}

export interface RecordsResponse {
  success: boolean;
  userId: string;
  role: UserRole;
  processedAt: string;
  delayMs: number;
  records: UserRecord[];
}
