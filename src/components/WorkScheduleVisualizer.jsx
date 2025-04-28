import React, { useState } from 'react';

const WorkScheduleVisualizer = ({ userRole, userId }) => {
  // Стан для працівників та тижнів
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Іваненко І.І.', position: 'Консультант', status: 'Основний', rate: 1.0 },
    { id: 2, name: 'Петренко П.П.', position: 'Діловод', status: 'Сумісник', rate: 0.5 },
    { id: 3, name: 'Сидоренко С.С.', position: 'Консультант', status: 'Основний', rate: 0.75 },
  ]);

  // Функція для ініціалізації тижнів
  const initializeWeeks = () => {
    // Отримуємо поточну дату
    const today = new Date(); // наприклад, 28.04.2025
    
    // Знаходимо понеділок поточного тижня
    const currentMonday = new Date(today);
    const dayOfWeek = today.getDay(); // 0 - неділя, 1 - понеділок, ..., 6 - субота
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // якщо неділя, то -6, інакше 1 - поточний день
    currentMonday.setDate(today.getDate() + diff);
    
    // Знаходимо неділю поточного тижня (кінець тижня - це неділя)
    const currentSunday = new Date(currentMonday);
    currentSunday.setDate(currentMonday.getDate() + 6);
    
    // Форматуємо дати
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };
    
    // Визначаємо номер тижня
    // Це спрощений варіант, у реальному додатку можна використовувати бібліотеку, наприклад, date-fns
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const millisecondsPerDay = 86400000; // кількість мілісекунд у дні
    const dayOfYear = Math.ceil((today - startOfYear) / millisecondsPerDay);
    const weekNumber = Math.ceil(dayOfYear / 7);
    
    // Створюємо масив тижнів: поточний і кілька попередніх і наступних
    const weeksArray = [];
    
    // Додаємо 2 попередні тижні
    for (let i = -2; i <= 2; i++) {
      const weekMonday = new Date(currentMonday);
      weekMonday.setDate(currentMonday.getDate() + i * 7);
      
      const weekSunday = new Date(weekMonday);
      weekSunday.setDate(weekMonday.getDate() + 6);
      
      weeksArray.push({
        id: weekNumber + i,
        number: weekNumber + i,
        startDate: formatDate(weekMonday),
        endDate: formatDate(weekSunday),
        isCurrent: i === 0 // поточний тиждень, де i === 0
      });
    }
    
    return weeksArray;
  };
  
  // В useState використовуємо цю функцію для початкової ініціалізації
  const [weeks, setWeeks] = useState(initializeWeeks());

  // Стан для модальних вікон
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Стан для форми додавання/редагування користувача
  const [userForm, setUserForm] = useState({
    name: '',
    position: 'Консультант',
    status: 'Основний',
    rate: 1.0
  });

  // Фіксовані дані
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
  const timeSlots = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

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

  // Функція для перевірки, чи працівник присутній в конкретний час і день
  const isEmployeePresent = (employeeId, day, time) => {
    const employeeSchedule = scheduleData[employeeId]?.[day] || [];
    return employeeSchedule.some(range => {
      const [start, end] = range.split('-');
      return time >= start && time < end;
    });
  };

  // Функція для редагування користувача
  const handleEditUser = (employee) => {
    setCurrentEmployee(employee);
    setUserForm({
      name: employee.name,
      position: employee.position,
      status: employee.status,
      rate: employee.rate
    });
    setShowEditUserModal(true);
  };

  // Функція для видалення користувача
  const handleDeleteUser = (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  // Функція для збереження зміненого користувача
  const handleSaveUser = () => {
    if (currentEmployee) {
      // Редагування існуючого користувача
      setEmployees(employees.map(emp => 
        emp.id === currentEmployee.id 
          ? { ...emp, ...userForm } 
          : emp
      ));
    } else {
      // Додавання нового користувача
      const newId = Math.max(...employees.map(emp => emp.id), 0) + 1;
      setEmployees([...employees, { id: newId, ...userForm }]);
    }
    
    setShowAddUserModal(false);
    setShowEditUserModal(false);
    setCurrentEmployee(null);
    setUserForm({
      name: '',
      position: 'Консультант',
      status: 'Основний',
      rate: 1.0
    });
  };
  
  // Функція для генерації нових тижнів
  const handleGenerateWeeks = () => {
    const lastWeek = weeks[weeks.length - 1];
    const newWeeks = [];
    
    // Розбираємо останню дату
    const lastEndDateParts = lastWeek.endDate.split('.');
    const lastEndDay = parseInt(lastEndDateParts[0]);
    const lastEndMonth = parseInt(lastEndDateParts[1]) - 1;
    const lastEndYear = parseInt(lastEndDateParts[2]);
    
    // Створюємо об'єкт Date для останнього дня останнього тижня
    const lastEndDate = new Date(lastEndYear, lastEndMonth, lastEndDay);
    
    for (let i = 1; i <= 4; i++) {
      // Початок тижня - понеділок після кінця попереднього тижня
      const startDate = new Date(lastEndDate);
      startDate.setDate(lastEndDate.getDate() + i * 7 - 6); // +1 день після неділі
      
      // Кінець тижня - неділя (початок + 6 днів)
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      // Форматуємо дати
      const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
      };
      
      newWeeks.push({
        id: lastWeek.id + i,
        number: lastWeek.number + i,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        isCurrent: false
      });
    }
    
    setWeeks([...weeks, ...newWeeks]);
    alert('Згенеровано 4 нових тижні');
  };

  // Модальне вікно додавання/редагування користувача
  const renderUserModal = (isEdit = false) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">
            {isEdit ? 'Редагування користувача' : 'Додавання нового користувача'}
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">ПІБ</label>
            <input 
              type="text" 
              className="border p-2 rounded w-full"
              value={userForm.name}
              onChange={(e) => setUserForm({...userForm, name: e.target.value})}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Посада</label>
            <select 
              className="border p-2 rounded w-full"
              value={userForm.position}
              onChange={(e) => setUserForm({...userForm, position: e.target.value})}
            >
              <option value="Консультант">Консультант</option>
              <option value="Діловод">Діловод</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Статус</label>
            <select 
              className="border p-2 rounded w-full"
              value={userForm.status}
              onChange={(e) => setUserForm({...userForm, status: e.target.value})}
            >
              <option value="Основний">Основний</option>
              <option value="Сумісник">Сумісник</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Ставка</label>
            <input 
              type="number" 
              className="border p-2 rounded w-full"
              min="0.1"
              max="1.5"
              step="0.1"
              value={userForm.rate}
              onChange={(e) => setUserForm({...userForm, rate: parseFloat(e.target.value)})}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button 
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => {
                setShowAddUserModal(false);
                setShowEditUserModal(false);
              }}
            >
              Скасувати
            </button>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleSaveUser}
            >
              Зберегти
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Панель адміністратора
  const renderAdminView = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Панель адміністратора</h2>
        
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">Управління користувачами</h3>
            <button 
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              onClick={() => {
                setCurrentEmployee(null);
                setUserForm({
                  name: '',
                  position: 'Консультант',
                  status: 'Основний',
                  rate: 1.0
                });
                setShowAddUserModal(true);
              }}
            >
              + Додати користувача
            </button>
            
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Ім'я</th>
                    <th className="p-2 text-left">Посада</th>
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
                        <button 
                          className="text-blue-500 mr-2"
                          onClick={() => handleEditUser(emp)}
                        >
                          Редагувати
                        </button>
                        <button 
                          className="text-red-500"
                          onClick={() => handleDeleteUser(emp.id)}
                        >
                          Видалити
                        </button>
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
              <div>
                Поточний тиждень: <strong>
                  {weeks.find(w => w.isCurrent)?.number || '?'}
                </strong> (
                  {weeks.find(w => w.isCurrent)?.startDate || '?'} - 
                  {weeks.find(w => w.isCurrent)?.endDate || '?'}
                )
              </div>
              <button 
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                onClick={handleGenerateWeeks}
              >
                Генерувати
              </button>
            </div>
            <div className="text-sm max-h-40 overflow-y-auto">
              {weeks.map(week => (
                <div 
                  key={week.id} 
                  className={`flex justify-between p-2 ${
                    week.isCurrent 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'bg-gray-100'
                  } mb-1`}
                >
                  <span>Тиждень {week.number} {week.isCurrent ? '(поточний)' : ''}</span>
                  <span>{week.startDate} - {week.endDate}</span>
                </div>
              ))}
            </div>
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

  // Панель керівника
  const renderManagerView = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Панель керівника</h2>
        
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium">
              Поточний тиждень: {weeks.find(w => w.isCurrent)?.number || '?'} (
                {weeks.find(w => w.isCurrent)?.startDate || '?'} - 
                {weeks.find(w => w.isCurrent)?.endDate || '?'}
              )
            </h3>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              onClick={() => alert('Функціональність друку буде додана пізніше')}
            >
              Друк
            </button>
            <button className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              onClick={() => alert('Функціональність експорту буде додана пізніше')}
            >
              Експорт
            </button>
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

  // Панель працівника
  const renderEmployeeView = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Мій графік роботи</h2>
        
        <div className="mb-4 flex items-center">
          <div>
            <span className="mr-2">
              Поточний тиждень: {weeks.find(w => w.isCurrent)?.number || '?'} (
                {weeks.find(w => w.isCurrent)?.startDate || '?'} - 
                {weeks.find(w => w.isCurrent)?.endDate || '?'}
              )
            </span>
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
            <button 
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => alert('Зміни будуть збережені після підключення до бази даних')}
            >
              Зберегти зміни
            </button>
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
            <button 
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => alert('Заявка буде подана після підключення до бази даних')}
            >
              Подати заявку
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Визначення, яке представлення показувати в залежності від ролі
  const renderViewByRole = () => {
    switch (userRole) {
      case 'admin':
        return renderAdminView();
      case 'manager':
        return renderManagerView();
      case 'employee':
        return renderEmployeeView();
      default:
        return <div>Невідома роль: {userRole}</div>;
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      {renderViewByRole()}
      
      {/* Модальне вікно додавання користувача */}
      {showAddUserModal && renderUserModal(false)}
      
      {/* Модальне вікно редагування користувача */}
      {showEditUserModal && renderUserModal(true)}
    </div>
  );
};

export default WorkScheduleVisualizer;