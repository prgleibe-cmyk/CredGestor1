import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Mock authentication
    setUser({
      id: 'admin-1',
      name: 'Administrador',
      role: 'admin'
    });
  }, []);

  const logout = () => {
    setUser(null);
    // In a real app, this would clear tokens etc.
  };

  return {
    user,
    isAuthenticated: !!user,
    logout
  };
}
