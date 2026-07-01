import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function MainLayout({ children }) {
  const { darkMode } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main
          className={`flex-1 overflow-y-auto transition-colors duration-300 p-6 ${
            darkMode
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;