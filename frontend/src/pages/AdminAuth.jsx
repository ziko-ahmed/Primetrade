import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAuth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill out all fields.');
            return;
        }
        setIsLoading(true);
        try {
            await login(email, password);
            toast.success('Admin access granted!');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4 w-full relative z-10">
            <div className="wrapper relative z-10 w-full flex justify-center mt-12">
                <div className="flip-card__inner w-full max-w-md">
                    {/* Front: Login */}
                    <div className="flip-card__front w-full !relative !transform-none !shadow-primary-500/20 shadow-2xl">
                        <div className="title text-3xl mb-6">Admin Portal</div>
                        <form className="flip-card__form w-full" onSubmit={handleLogin} noValidate>
                            <input
                                className="flip-card__input w-full"
                                name="email"
                                placeholder="Admin Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                className="flip-card__input w-full"
                                name="password"
                                placeholder="Security Passcode"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button className="flip-card__btn w-full mt-4" type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin text-white" /> : 'Authenticate'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAuth;
