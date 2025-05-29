
export interface User {
  id?: string;
  name: string;
  email?: string;
  role: "admin" | "student";
  token: string;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}
