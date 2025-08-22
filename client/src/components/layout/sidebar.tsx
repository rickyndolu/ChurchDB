import { Link, useLocation } from "wouter";
import { Users, Home, MapPin, BarChart3, LogOut } from "lucide-react";
import { authManager } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  const authState = authManager.getAuthState();

  const handleLogout = () => {
    authManager.logout();
    window.location.href = '/login';
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Data Jemaat', href: '/members', icon: Users },
    { name: 'Data Keluarga', href: '/families', icon: Home },
    { name: 'Data Rayon', href: '/districts', icon: MapPin },
  ];

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 bg-primary text-white">
        <h1 className="text-xl font-bold" data-testid="sidebar-title">Manajemen Jemaat</h1>
      </div>
      
      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "text-primary-700 bg-primary-50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "mr-3 h-5 w-5",
                  isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500"
                )} />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary-600" />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700" data-testid="user-name">
              {authState.user?.username || 'Admin'}
            </p>
            <button 
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
              data-testid="button-logout"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
