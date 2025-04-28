import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import supabase from '../config/supabaseClient';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    position: '',
    status: '',
    rate: 1.0
  });
  
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          position: data.position || '',
          status: data.status || '',
          rate: data.rate || 1.0
        });
        
      } catch (error) {
        console.error('Помилка отримання профілю:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    getProfile();
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile(prev => ({
        ...prev,
        ...formData
      }));
      
      alert('Профіль оновлено успішно!');
      
    } catch (error) {
      console.error('Помилка оновлення профілю:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !profile) {
    return <div className="flex items-center justify-center h-screen">Завантаження профілю...</div>;
  }
  
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Мій профіль</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="border-b pb-4 mb-4">
          <div className="text-gray-500 mb-1">Email</div>
          <div className="font-medium">{user.email}</div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="full_name">
              Повне ім'я
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              Телефон
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="phone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="bg-gray-100 p-4 rounded mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Посада
              </label>
              <div className="text-gray-800">{formData.position || 'Не вказано'}</div>
              <div className="text-sm text-gray-500">Змінюється адміністратором</div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Статус
              </label>
              <div className="text-gray-800">{formData.status || 'Не вказано'}</div>
              <div className="text-sm text-gray-500">Змінюється адміністратором</div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Ставка
              </label>
              <div className="text-gray-800">{formData.rate} (
                {formData.rate * 40} годин/тиждень)
              </div>
              <div className="text-sm text-gray-500">Змінюється адміністратором</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Зберігання...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;