import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import supabase from '../config/supabaseClient';
import Sidebar from '../components/Sidebar';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Перевірка ролі користувача
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (userError) throw userError;
        
        setUserRole(userData.role);
        
        if (userData.role !== 'admin' && userData.role !== 'manager') {
          setError('Доступ заборонено. Тільки керівники та адміністратори мають доступ до цієї сторінки.');
          return;
        }
        
        // Отримання даних про працівників
        const { data: empData, error: empError } = await supabase
          .from('profiles')
          .select('*')
          .order('full_name');
          
        if (empError) throw empError;
        setEmployees(empData || []);
        
      } catch (error) {
        console.error('Помилка отримання даних:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Завантаження...</div>;
  }

  if (error && error.includes('Доступ заборонено')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold mb-2">Доступ заборонено</h2>
          <p>{error}</p>
          <div className="mt-4">
            <a href="/dashboard" className="text-blue-500 hover:underline">
              Повернутися на головну
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <h2 className="text-xl font-semibold">Звіти</h2>
        </header>
        
        <main className="p-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Завантаженість працівників</h3>
            
            <div className="space-y-6">
              {employees.map(emp => (
                <div key={emp.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{emp.full_name}</span>
                    <span>{emp.rate * 40} год / тиждень</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${emp.rate * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{emp.status}</span>
                    <span>{emp.position}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Відпустки (поточний місяць)</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Працівник
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Початок
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Закінчення
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Іваненко І.І.
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        01.04.2025
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        14.04.2025
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Затверджено
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;