export interface SwellUser {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  [key: string]: any;
}

export interface Account {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  session_token?: string;
  sessionToken?: string;
  token?: string;
  session?: {
    token?: string;
    id?: string;
  };
  success?: boolean;
  errors?: Array<{ message: string }>;
  error?: string;
  message?: string;
  [key: string]: any;
}

export interface ErrorResponse {
  errors: Array<{ message: string }>;
  error?: string;
  message?: string;
  success: false;
}

export interface LoginResult {
  success: boolean;
  user?: SwellUser;
  error?: string;
}
