import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, User, Users, Settings, Bell, FileText, LogOut } from 'lucide-react';

const Sidebar = ({ userRole }) => {
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const { user } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="font-bold text-xl">Візуалізатор часу</h1>
        <p className="text-gray-400 text-sm">{userRole ? `Роль: ${userRole}` : 'Гість'}</p>
      </div>
      
      <nav className="mt-4 flex-grow">
        <ul>
          <li className="mb-2">
            <Link
              to="/dashboard"
              className={`flex items-center p-3 text-white rounded ${
                location.pathname === '/dashboard' ? 'bg-blue-700' : 'hover:bg-gray-700'
              }`}
            >
              <Calendar size={18} className="mr-2" />
              <span>Графік роботи</span>
            </Link>
          </li>
          
          {/* Меню для адміністратора */}
          {userRole === 'admin' && (
            <li className="mb-2">
              <Link
                to="/admin"
                className={`flex items-center p-3 text-white rounded ${
                  location.pathname === '/admin' ? 'bg-blue-700' : 'hover:bg-gray-700'
                }`}
              >
                <Settings size={18} className="mr-2" />
                <span>Адміністрування</span>
              </Link>
            </li>
          )}
          
          {/* Меню для керівника */}
          {(userRole === 'manager' || userRole === 'admin') && (
            <li className="mb-2">
              <Link
                to="/reports"
                className={`flex items-center p-3 text-white rounded ${
                  location.pathname === '/reports' ? 'bg-blue-700' : 'hover:bg-gray-700'
                }`}
              >
                <FileText size={18} className="mr-2" />
                <span>Звіти</span>
              </Link>
            </li>
          )}
          
          {/* Спільне меню */}
          <li className="mb-2">
            <Link
              to="/profile"
              className={`flex items-center p-3 text-white rounded ${
                location.pathname === '/profile' ? 'bg-blue-700' : 'hover:bg-gray-700'
              }`}
            >
              <User size={18} className="mr-2" />
              <span>Мій профіль</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-4">
          <div className="mr-2 bg-gray-600 p-2 rounded-full">
            <User size={20} />
          </div>
          <div>
            <div className="font-medium">{user?.email}</div>
            <div className="text-xs text-gray-400">Онлайн</div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <LogOut size={18} className="mr-2" />
          <span>Вийти</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;