
import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./auth-context";
import type { AuthContextType, User, UserDTO } from "./auth-types";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user from localStorage
    const savedUser = localStorage.getItem('eduSyncUser');
    console.log('AuthProvider: Checking saved user:', savedUser);
    
    if (savedUser) {
      try {
        const userData: UserDTO = JSON.parse(savedUser);
        console.log('AuthProvider: Parsed user data:', userData);
        
        const userObj = {
          id: userData.id,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          role: userData.role,
          token: userData.token
        };
        
        console.log('AuthProvider: Setting user:', userObj);
        setUser(userObj);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('eduSyncUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    console.log('AuthProvider: Login called with:', userData);
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    console.log('AuthProvider: Logout called');
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

  console.log('AuthProvider: Current auth state:', {
    user: user ? { id: user.id, role: user.role } : null,
    isAuthenticated: !!user,
    loading
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
