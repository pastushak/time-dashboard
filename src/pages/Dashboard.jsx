import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import supabase from '../config/supabaseClient';
import Sidebar from '../components/Sidebar';
import WorkScheduleVisualizer from '../components/WorkScheduleVisualizer';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setUserRole(data.role);
      } catch (error) {
        console.error('Помилка отримання профілю:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) getUserProfile();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Завантаження...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <h2 className="text-xl font-semibold">Графік роботи</h2>
        </header>
        
        {error && (
          <div className="m-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <main className="p-6">
          <WorkScheduleVisualizer userRole={userRole} userId={user.id} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;