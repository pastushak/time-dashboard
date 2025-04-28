import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import supabase from '../config/supabaseClient';
import { User, Clock, Calendar, ArrowLeft, ArrowRight, Plus, Save, Trash } from 'lucide-react';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [workWeeks, setWorkWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Форми для додавання/редагування
  const [userForm, setUserForm] = useState({
    email: '',
    full_name: '',
    position: 'консультант',
    status: 'основний',
    rate: 1.0,
    role: 'employee'
  });
  
  const [weekForm, setWeekForm] = useState({
    week_number: '',
    start_date: '',
    end_date: '',
    year: new Date().getFullYear()
  });
  
  const [showUserForm, setShowUserForm] = useState(false);
  const [showWeekForm, setShowWeekForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  
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
        
        if (userData.role !== 'admin') {
          setError('Доступ заборонено. Тільки адміністратори мають доступ до цієї сторінки.');
          return;
        }
        
        // Отримання користувачів
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*, auth_users:id(email)')
          .order('full_name');
          
        if (usersError) throw usersError;
        setUsers(usersData || []);
        
        // Отримання робочих тижнів
        const { data: weeksData, error: weeksError } = await supabase
          .from('work_weeks')
          .select('*')
          .order('start_date', { ascending: false });
          
        if (weeksError) throw weeksError;
        setWorkWeeks(weeksData || []);
        
      } catch (error) {
        console.error('Помилка отримання даних:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user.id]);
  
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: name === 'rate' ? parseFloat(value) : value
    }));
  };
  
  const handleWeekFormChange = (e) => {
    const { name, value } = e.target;
    setWeekForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Створення користувача через auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userForm.email,
        password: 'temporary123', // Тимчасовий пароль
        email_confirm: true
      });
      
      if (authError) throw authError;
      
      // Створення профілю в profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: userForm.full_name,
            position: userForm.position,
            status: userForm.status,
            rate: userForm.rate,
            role: userForm.role
          }
        ]);
        
      if (profileError) throw profileError;
      
      // Оновлення списку користувачів
      const { data: newUsersData } = await supabase
        .from('profiles')
        .select('*, auth_users:id(email)')
        .order('full_name');
        
      setUsers(newUsersData);
      
      // Очищення форми
      setUserForm({
        email: '',
        full_name: '',
        position: 'консультант',
        status: 'основний',
        rate: 1.0,
        role: 'employee'
      });
      
      setShowUserForm(false);
      
    } catch (error) {
      console.error('Помилка створення користувача:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditUser = (userId) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setUserForm({
        email: userToEdit.auth_users?.email || '',
        full_name: userToEdit.full_name || '',
        position: userToEdit.position || 'консультант',
        status: userToEdit.status || 'основний',
        rate: userToEdit.rate || 1.0,
        role: userToEdit.role || 'employee'
      });
      setEditingUserId(userId);
      setShowUserForm(true);
    }
  };
  
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!editingUserId) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userForm.full_name,
          position: userForm.position,
          status: userForm.status,
          rate: userForm.rate,
          role: userForm.role,
          updated_at: new Date()
        })
        .eq('id', editingUserId);
        
      if (error) throw error;
      
      // Оновлення списку користувачів
      const { data: updatedUsersData } = await supabase
        .from('profiles')
        .select('*, auth_users:id(email)')
        .order('full_name');
        
      setUsers(updatedUsersData);
      
      // Очищення форми
      setUserForm({
        email: '',
        full_name: '',
        position: 'консультант',
        status: 'основний',
        rate: 1.0,
        role: 'employee'
      });
      
      setEditingUserId(null);
      setShowUserForm(false);
      
    } catch (error) {
      console.error('Помилка оновлення користувача:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddWeek = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('work_weeks')
        .insert([
          {
            week_number: parseInt(weekForm.week_number),
            start_date: weekForm.start_date,
            end_date: weekForm.end_date,
            year: parseInt(weekForm.year)
          }
        ]);
        
      if (error) throw error;
      
      // Оновлення списку тижнів
      const { data: newWeeksData } = await supabase
        .from('work_weeks')
        .select('*')
        .order('start_date', { ascending: false });
        
      setWorkWeeks(newWeeksData);
      
      // Очищення форми
      setWeekForm({
        week_number: '',
        start_date: '',
        end_date: '',
        year: new Date().getFullYear()
      });
      
      setShowWeekForm(false);
      
    } catch (error) {
      console.error('Помилка створення тижня:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const generateWeeks = async () => {
    try {
      setLoading(true);
      
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const weeks = [];
      
      // Генерація тижнів на рік
      for (let i = 1; i <= 52; i++) {
        const startDate = new Date(startOfYear);
        startDate.setDate(startDate.getDate() + (i - 1) * 7);
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        weeks.push({
          week_number: i,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          year: currentYear
        });
      }
      
      // Додавання тижнів в базу даних
      const { error } = await supabase
        .from('work_weeks')
        .insert(weeks);
        
      if (error) throw error;
      
      // Оновлення списку тижнів
      const { data: newWeeksData } = await supabase
        .from('work_weeks')
        .select('*')
        .order('start_date', { ascending: false });
        
      setWorkWeeks(newWeeksData);
      
      alert('Тижні успішно згенеровано!');
      
    } catch (error) {
      console.error('Помилка генерації тижнів:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && users.length === 0) {
    return <div className="flex items-center justify-center h-screen">Завантаження даних...</div>;
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Панель адміністратора</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-3 font-medium ${activeTab === 'users' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('users')}
          >
            <User size={18} className="inline mr-1" /> Користувачі
          </button>
          <button
            className={`px-4 py-3 font-medium ${activeTab === 'weeks' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('weeks')}
          >
            <Calendar size={18} className="inline mr-1" /> Робочі тижні
          </button>
          <button
            className={`px-4 py-3 font-medium ${activeTab === 'settings' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Clock size={18} className="inline mr-1" /> Налаштування
          </button>
        </div>
        
        <div className="p-4">
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setUserForm({
                      email: '',
                      full_name: '',
                      position: 'консультант',
                      status: 'основний',
                      rate: 1.0,
                      role: 'employee'
                    });
                    setEditingUserId(null);
                    setShowUserForm(!showUserForm);
                  }}
                  className="bg-blue-500 text-white px-3 py-2 rounded flex items-center"
                >
                  <Plus size={18} className="mr-1" /> Додати користувача
                </button>
              </div>
              
              {showUserForm && (
                <div className="bg-gray-50 p-4 mb-4 rounded border">
                  <h3 className="text-lg font-medium mb-3">
                    {editingUserId ? 'Редагування користувача' : 'Новий користувач'}
                  </h3>
                  <form onSubmit={editingUserId ? handleUpdateUser : handleAddUser}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={userForm.email}
                          onChange={handleUserFormChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                          disabled={editingUserId !== null}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          ПІБ
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={userForm.full_name}
                          onChange={handleUserFormChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Посада
                        </label>
                        <select
                          name="position"
                          value={userForm.position}
                          onChange={handleUserFormChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          <option value="консультант">Консультант</option>
                          <option value="діловод">Діловод</option>
                          <option value="керівник">Керівник</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Статус
                        </label>
                        <select
                          name="status"
                          value={userForm.status}
                          onChange={handleUserFormChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          <option value="основний">Основне місце роботи</option>
                          <option value="сумісник">Сумісництво</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Ставка
                        </label>
                        <input
                          type="number"
                          name="rate"
                          value={userForm.rate}
                          onChange={handleUserFormChange}
                          min="0.1"
                          max="1.5"
                          step="0.1"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Роль в системі
                        </label>
                        <select
                          name="role"
                          value={userForm.role}
                          onChange={handleUserFormChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          <option value="employee">Працівник</option>
                          <option value="manager">Керівник</option>
                          <option value="admin">Адміністратор</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => setShowUserForm(false)}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                      >
                        Скасувати
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                        disabled={loading}
                      >
                        <Save size={18} className="mr-1" />
                        {loading ? 'Збереження...' : 'Зберегти'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Користувач
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Посада/Статус
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ставка
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Роль
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дії
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User size={20} className="text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.auth_users?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.position}</div>
                          <div className="text-sm text-gray-500">{user.status}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.rate}</div>
                          <div className="text-sm text-gray-500">{user.rate * 40} год/тиждень</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                             user.role === 'manager' ? 'bg-green-100 text-green-800' : 
                             'bg-blue-100 text-blue-800'}`}>
                            {user.role === 'admin' ? 'Адміністратор' : 
                             user.role === 'manager' ? 'Керівник' : 'Працівник'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEditUser(user.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Редагувати
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'weeks' && (
            <div>
              <div className="flex justify-between mb-4">
                <button
                  onClick={generateWeeks}
                  className="bg-green-500 text-white px-3 py-2 rounded flex items-center"
                >
                  <Calendar size={18} className="mr-1" /> Згенерувати тижні на рік
                </button>
                
                <button
                  onClick={() => setShowWeekForm(!showWeekForm)}
                  className="bg-blue-500 text-white px-3 py-2 rounded flex items-center"
                >
                  <Plus size={18} className="mr-1" /> Додати тиждень
                </button>
              </div>
              
              {showWeekForm && (
                <div className="bg-gray-50 p-4 mb-4 rounded border">
                  <h3 className="text-lg font-medium mb-3">Новий робочий тиждень</h3>
                  <form onSubmit={handleAddWeek}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Номер тижня
                        </label>
                        <input
                          type="number"
                          name="week_number"
                          value={weekForm.week_number}
                          onChange={handleWeekFormChange}
                          min="1"
                          max="53"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Рік
                        </label>
                        <input
                          type="number"
                          name="year"
                          value={weekForm.year}
                          onChange={handleWeekFormChange}
                          min="2023"
                          max="2030"
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Дата початку
                        </label>
                        <input
                          type="date"
                          name="start_date"
                          value={weekForm.start_date}
                          onChange={handleWeekFormChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Дата закінчення
                        </label>
                        <input
                          type="date"
                          name="end_date"
                          value={weekForm.end_date}
                          onChange={handleWeekFormChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => setShowWeekForm(false)}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                      >
                        Скасувати
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                        disabled={loading}
                      >
                        <Save size={18} className="mr-1" />
                        {loading ? 'Збереження...' : 'Зберегти'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Тиждень
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Початок
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Кінець
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Рік
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workWeeks.map(week => (
                      <tr key={week.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Тиждень {week.week_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(week.start_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(week.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{week.year}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Налаштування робочого часу</h3>
              
              <div className="bg-white p-4 rounded shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-3">
                      <label className="block text-sm mb-1">Початок робочого дня</label>
                      <input type="time" defaultValue="08:00" className="border p-2 rounded w-full" />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm mb-1">Кінець робочого дня</label>
                      <input type="time" defaultValue="17:00" className="border p-2 rounded w-full" />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm mb-1">Тривалість обідньої перерви (години)</label>
                      <input type="number" defaultValue="1" className="border p-2 rounded w-full" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Категорії працівників</h3>
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                      <span>Основне місце роботи</span>
                        <button className="text-blue-500">Редагувати</button>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Сумісництво</span>
                        <button className="text-blue-500">Редагувати</button>
                      </div>
                      <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">+ Додати категорію</button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded">Зберегти налаштування</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;