import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gyansetu-user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    // Default demo session
    return {
      id: "demo-user",
      email: "demo@gyansetu.edu",
      displayName: "Ayushman Bisht",
      college: "Institute of Technology",
      target: "SDE-1 / Campus Placements 2026",
      preferredLanguage: "javascript",
      streak: 7,
      xp: 1450,
      level: 4,
      dailyGoal: 3,
      dailySolvedToday: 1,
      isDemo: true
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gyansetu-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gyansetu-user');
    }
  }, [user]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async ({ email, password, displayName, college }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, college })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (e) {
      setUser(prev => ({ ...prev, ...updates }));
    }
  };

  const loadDemoUser = () => {
    const demo = {
      id: "demo-user",
      email: "demo@gyansetu.edu",
      displayName: "Ayushman Bisht",
      college: "Institute of Technology",
      target: "SDE-1 / Campus Placements 2026",
      preferredLanguage: "javascript",
      streak: 7,
      xp: 1450,
      level: 4,
      dailyGoal: 3,
      dailySolvedToday: 1,
      isDemo: true
    };
    setUser(demo);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      updateProfile,
      loadDemoUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
