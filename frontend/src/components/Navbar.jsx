import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, LayoutDashboard, UserCircle, Sun, Moon, Users, Shield } from 'lucide-react';
import AnimatedButton from './AnimatedButton';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-header">
            <div className="w-full mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                <div className="flex-shrink-0">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-300">
                            Primetrade
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors"
                        title="Toggle dark mode"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {user ? (
                        <>
                            {user.role === 'superadmin' && (
                                <Link to="/super-admin/dashboard" className="p-2 rounded-lg text-text-muted hover:text-emerald-500 hover:bg-surface transition-colors" title="Super Admin Dashboard">
                                    <Shield className="w-5 h-5" />
                                </Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin/users" className="p-2 rounded-lg text-text-muted hover:text-primary-500 hover:bg-surface transition-colors" title="Manage Users">
                                    <Users className="w-5 h-5" />
                                </Link>
                            )}
                            <div className="flex items-center gap-2 text-text-muted max-w-[200px]">
                                <UserCircle className="w-5 h-5 shrink-0" />
                                <span className="hidden sm:block font-medium text-text-main truncate max-w-[150px]" title={user.name}>{user.name}</span>
                            </div>
                            <AnimatedButton
                                text="Logout"
                                icon={LogOut}
                                onClick={handleLogout}
                                className="h-11 px-3 sm:px-4 min-w-[100px] sm:min-w-[140px] text-sm"
                            />
                        </>
                    ) : (
                        <div className="flex gap-3">
                            <Link to="/login" className="btn-secondary py-1.5 px-5 text-sm whitespace-nowrap">
                                Log in
                            </Link>
                            <Link to="/register" className="btn-primary py-1.5 px-5 text-sm !w-auto whitespace-nowrap">
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
