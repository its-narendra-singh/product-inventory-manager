import { NavLink, useNavigate } from 'react-router-dom';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
];

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    navigate('/login');
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-lg font-semibold text-blue-600 tracking-tight">Inventory</span>
          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
