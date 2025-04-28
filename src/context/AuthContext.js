import { createContext, useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Перевірка поточного сеансу
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
      setLoading(false);
    };

    // Слухач змін стану авторизації
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Функції авторизації
  const login = (email, password) => 
    supabase.auth.signInWithPassword({ email, password });

  const logout = () => supabase.auth.signOut();

  const register = (email, password) => 
    supabase.auth.signUp({ email, password });

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};