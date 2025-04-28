import React, { useState } from 'react';
import WorkScheduleVisualizer from './components/WorkScheduleVisualizer';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState('admin');

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Візуалізатор робочого часу</h1>
      </header>
      <main className="container mx-auto p-4">
        <div className="mb-4 bg-white rounded shadow p-4">
          <div className="flex items-center gap-2">
            <div className="font-medium">Перегляд як:</div>
            <select 
              className="border p-1 rounded"
              onChange={(e) => setUserRole(e.target.value)}
              value={userRole}
            >
              <option value="admin">Адміністратор</option>
              <option value="manager">Керівник</option>
              <option value="employee">Працівник</option>
            </select>
          </div>
        </div>
        <WorkScheduleVisualizer 
          userRole={userRole} 
          userId="1"
        />
      </main>
    </div>
  );
}

export default App;