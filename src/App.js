import React from 'react';
import WorkScheduleVisualizer from './components/WorkScheduleVisualizer';
import './App.css';

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Візуалізатор робочого часу</h1>
      </header>
      <main className="container mx-auto p-4">
        <WorkScheduleVisualizer 
          userRole="admin" // Можна міняти для тестування різних ролей
          userId="1"
        />
      </main>
    </div>
  );
}

export default App;