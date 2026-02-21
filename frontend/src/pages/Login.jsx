import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const location = useLocation();
    const isRegisterRoute = location.pathname === '/register' || location.pathname === '/user/register';
    const [isRegister, setIsRegister] = useState(isRegisterRoute);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [groupName, setGroupName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [signupMode, setSignupMode] = useState('create'); // 'create' or 'join'
    const [isLoading, setIsLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();

        if (isRegister) {
            if (signupMode === 'create' && (!name || !email || !password || !groupName)) {
                toast.error('Please fill out all fields entirely.');
                return;
            }
            if (signupMode === 'join' && (!name || !email || !password || !joinCode)) {
                toast.error('Please fill out all fields including Join Code.');
                return;
            }
        }
        if (!isRegister && (!email || !password)) {
            toast.error('Please fill out all fields.');
            return;
        }

        setIsLoading(true);
        try {
            if (isRegister) {
                if (password.length < 6) {
                    toast.error('Password must be at least 6 characters.');
                    setIsLoading(false);
                    return;
                }

                const actualGroupName = signupMode === 'create' ? groupName : undefined;
                const actualJoinCode = signupMode === 'join' ? joinCode : undefined;

                await register(name, email, password, actualGroupName, actualJoinCode);
                toast.success(signupMode === 'create' ? 'Workspace created successfully!' : 'Joined workspace successfully!');
            } else {
                await login(email, password);
                toast.success('Successfully logged in!');
            }
            navigate('/user/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[80vh] items-center justify-center p-4 w-full relative z-10">
            {/* Toggle */}
            <div className="mb-12 flex gap-8 z-20">
                <button
                    onClick={() => setIsRegister(false)}
                    className={`text-xl font-bold uppercase tracking-wider transition-colors ${!isRegister ? 'text-primary-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Login
                </button>
                <div className="w-0.5 bg-gray-700 h-6 my-auto"></div>
                <button
                    onClick={() => setIsRegister(true)}
                    className={`text-xl font-bold uppercase tracking-wider transition-colors ${isRegister ? 'text-primary-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Sign Up
                </button>
            </div>

            <div className="login-container w-full max-w-sm mx-auto flex justify-center">
                <div className={`login-card w-full ${isRegister ? 'is-register' : ''}`}>
                    <div className="login-title mb-8">
                        <span className="login-text text-3xl">{isRegister ? 'Sign Up' : 'Login'}</span>
                    </div>
                    <form className="login-form space-y-4" onSubmit={handleAuth} noValidate>
                        {isRegister && (
                            <>
                                <div className="flex gap-4 mb-6 justify-center w-full">
                                    <button
                                        type="button"
                                        onClick={() => setSignupMode('create')}
                                        className={`flex-1 py-3 text-sm font-bold transition-all border-2 border-black ${signupMode === 'create' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:bg-gray-100'} rounded-none`}
                                    >
                                        Create Workspace
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSignupMode('join')}
                                        className={`flex-1 py-3 text-sm font-bold transition-all border-2 border-black ${signupMode === 'join' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:bg-gray-100'} rounded-none`}
                                    >
                                        Join Workspace
                                    </button>
                                </div>
                                <div className="input-group w-full">
                                    <input
                                        placeholder="Full Name"
                                        className="login-input w-full"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                {signupMode === 'create' ? (
                                    <div className="input-group w-full">
                                        <input
                                            placeholder="Company / Workspace Name"
                                            className="login-input w-full"
                                            type="text"
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    <div className="input-group w-full">
                                        <input
                                            placeholder="Join Code (Provided by your Admin)"
                                            className="login-input w-full"
                                            type="text"
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value)}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        <div className="input-group w-full">
                            <input
                                placeholder="Email Address"
                                className="login-input w-full"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="input-group w-full">
                            <input
                                placeholder="Password"
                                className="login-input w-full"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button className="login-btn mt-6 w-full" type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin text-white" /> : 'ENTER ZONE'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
