import React, { useState } from 'react';
import { Calendar, Clock, Bell, FileText, Settings, User } from 'lucide-react';

const WorkScheduleVisualizer = ({ userRole, userId }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Фіктивні дані
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
  const timeSlots = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  const employees = [
    { id: 1, name: 'Іваненко І.І.', position: 'Консультант', status: 'Основний', rate: 1.0 },
    { id: 2, name: 'Петренко П.П.', position: 'Діловод', status: 'Сумісник', rate: 0.5 },
    { id: 3, name: 'Сидоренко С.С.', position: 'Консультант', status: 'Основний', rate: 0.75 },
  ];

  const scheduleData = {
    1: {
      'Пн': ['8:00-12:00', '13:00-17:00'],
      'Вт': ['8:00-12:00', '13:00-17:00'],
      'Ср': ['8:00-12:00', '13:00-17:00'],
      'Чт': ['8:00-12:00', '13:00-17:00'],
      'Пт': ['8:00-12:00', '13:00-17:00'],
    },
    2: {
      'Пн': ['8:00-12:00'],
      'Вт': ['13:00-17:00'],
      'Ср': ['8:00-12:00'],
      'Чт': ['13:00-17:00'],
      'Пт': ['8:00-12:00'],
    },
    3: {
      'Пн': ['8:00-12:00', '13:00-15:00'],
      'Вт': ['9:00-12:00', '13:00-17:00'],
      'Ср': ['8:00-12:00', '13:00-15:00'],
      'Чт': ['9:00-12:00', '13:00-17:00'],
      'Пт': ['8:00-12:00', '13:00-15:00'],
    },
  };

  // Перевірка присутності працівника
  const isEmployeePresent = (employeeId, day, time) => {
    const employeeSchedule = scheduleData[employeeId]?.[day] || [];
    return employeeSchedule.some(range => {
      const [start, end] = range.split('-');
      return time >= start && time < end;
    });
  };

  // Відображення вмісту залежно від ролі
  const renderContent = () => {
    switch (userRole) {
      case 'admin':
        return renderAdminContent();
      case 'manager':
        return renderManagerContent();
      default:
        return renderEmployeeContent();
    }
  };

  // Вміст для адміністратора
  const renderAdminContent = () => {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Панель адміністратора</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">Управління користувачами</h3>
            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">+ Додати користувача</button>
            <div className="mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Ім'я</th>
                    <th className="p-2 text-left">Роль</th>
                    <th className="p-2 text-left">Статус</th>
                    <th className="p-2 text-left">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="border-b">
                      <td className="p-2">{emp.name}</td>
                      <td className="p-2">{emp.position}</td>
                      <td className="p-2">{emp.status}</td>
                      <td className="p-2">
                        <button className="text-blue-500 mr-2">Редагувати</button>
                        <button className="text-red-500">Видалити</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">Управління тижнями</h3>
            <div className="flex items-center justify-between mb-4">
              <div>Поточний тиждень: <strong>12</strong> (18.03 - 24.03.2025)</div>
              <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">Генерувати</button>
            </div>
            <div className="text-sm">
              <div className="flex justify-between p-2 bg-gray-100">
                <span>Тиждень 11</span>
                <span>11.03 - 17.03.2025</span>
              </div>
              <div className="flex justify-between p-2 bg-blue-50 border-l-4 border-blue-500">
                <span>Тиждень 12 (поточний)</span>
                <span>18.03 - 24.03.2025</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-100">
                <span>Тиждень 13</span>
                <span>25.03 - 31.03.2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Вміст для керівника
  const renderManagerContent = () => {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Панель керівника</h2>
        
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium">Поточний тиждень: 12 (18.03 - 24.03.2025)</h3>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Друк</button>
            <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">Експорт</button>
          </div>
        </div>
        
        <div className="bg-white rounded shadow overflow-x-auto">
          <div className="p-3 bg-blue-50 border-b">
            <h3 className="font-medium">Моніторинг присутності у реальному часі</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Працівник</th>
                <th className="p-2 text-left">Статус</th>
                <th className="p-2 text-left">Ставка</th>
                {weekDays.map(day => (
                  <th key={day} className="p-2 text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} className="border-b">
                  <td className="p-2 font-medium">{emp.name}</td>
                  <td className="p-2">{emp.status} <span className="text-xs text-gray-500">({emp.position})</span></td>
                  <td className="p-2">{emp.rate}</td>
                  {weekDays.map(day => (
                    <td key={day} className="p-1">
                      <div className="grid grid-cols-5 gap-1">
                        {['8:00', '9:00', '12:00', '13:00', '16:00'].map(time => (
                          <div 
                            key={time} 
                            className={`h-6 w-6 rounded-sm ${isEmployeePresent(emp.id, day, time) ? 'bg-green-500' : 'bg-gray-200'}`}
                            title={`${time} - ${isEmployeePresent(emp.id, day, time) ? 'Присутній' : 'Відсутній'}`}
                          />
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Вміст для працівника
  const renderEmployeeContent = () => {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Мій графік</h2>
        
        <div className="mb-4 flex items-center">
          <div>
            <span className="mr-2">Поточний тиждень: 12 (18.03 - 24.03.2025)</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Основний</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs ml-1">1.0 ставка</span>
          </div>
        </div>
        
        <div className="bg-white rounded shadow overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Години / День</th>
                {weekDays.map(day => (
                  <th key={day} className="p-2 text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time, index) => (
                <tr key={time} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 font-medium">{time}</td>
                  {weekDays.map(day => (
                    <td 
                      key={day} 
                      className={`p-2 text-center ${
                        isEmployeePresent(1, day, time) 
                          ? day === 'Чт' 
                            ? 'bg-yellow-100' 
                            : 'bg-green-100' 
                          : ''
                      }`}
                    >
                      {isEmployeePresent(1, day, time) && (
                        day === 'Чт' ? '✓*' : '✓'
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-3">Коригування поточного тижня</h3>
            <div className="mb-3">
              <label className="block text-sm mb-1">День тижня</label>
              <select className="border p-2 rounded w-full">
                <option>Понеділок</option>
                <option>Вівторок</option>
                <option>Середа</option>
                <option>Четвер</option>
                <option>П'ятниця</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-sm mb-1">Початок</label>
                <input type="time" className="border p-2 rounded w-full" />
              </div>
              <div>
                <label className="block text-sm mb-1">Кінець</label>
                <input type="time" className="border p-2 rounded w-full" />
              </div>
            </div>
            <button className="bg-blue-500 text-white px-3 py-1 rounded">Зберегти зміни</button>
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-3">Планування відпустки</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-sm mb-1">Дата початку</label>
                <input type="date" className="border p-2 rounded w-full" />
              </div>
              <div>
                <label className="block text-sm mb-1">Дата закінчення</label>
                <input type="date" className="border p-2 rounded w-full" />
              </div>
            </div>
            <button className="bg-blue-500 text-white px-3 py-1 rounded">Подати заявку</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow">
      {renderContent()}
    </div>
  );
};

export default WorkScheduleVisualizer;