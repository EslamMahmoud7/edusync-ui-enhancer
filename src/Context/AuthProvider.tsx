
import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./auth-context";
import type { AuthContextType, User, UserDTO } from "./auth-types";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('eduSyncUser');
    if (savedUser) {
      try {
        const userData: UserDTO = JSON.parse(savedUser);
        setUser({
          id: userData.id,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          role: userData.role,
          token: userData.token
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('eduSyncUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eduSyncUser');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
