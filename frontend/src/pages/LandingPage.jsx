import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, LayoutDashboard, CheckCircle, Users, Activity, Lock } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="flex flex-col w-full min-h-[90vh] overflow-x-hidden">
            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 text-center animate-fade-in relative z-10 w-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-text-main mb-6 max-w-4xl">
                    Task management, <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-400 drop-shadow-sm">
                        done right.
                    </span>
                </h1>
                <p className="mt-6 max-w-2xl text-xl text-text-muted mb-10 mx-auto leading-relaxed">
                    Organize your workflow, track priorities, and collaborate with your team in real-time. Experience the most intuitive Kanban dashboard built for speed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto px-4">
                    <Link to="/user/register" className="btn-primary px-8 py-4 text-base gap-2 w-full sm:w-auto justify-center shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40">
                        Get Started Free
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/user/login" className="btn-secondary px-8 py-4 text-base w-full sm:w-auto justify-center bg-surface/50 hover:bg-surface">
                        Sign In
                    </Link>
                </div>
            </section>

            {/* Core Features Grid */}
            <section className="py-24 bg-surface/30 border-y border-border-main relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-4">Everything you need to succeed</h2>
                        <p className="text-lg text-text-muted max-w-2xl mx-auto">Powerful features baked right into a clean, distraction-free interface.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={LayoutDashboard}
                            title="Interactive Kanban"
                            desc="Drag and drop tasks across columns seamlessly. Visual progress tracking keeps you focused."
                        />
                        <FeatureCard
                            icon={Activity}
                            title="Live Activity Feed"
                            desc="Watch updates happen in real-time. Integrated WebSocket technology ensures you never miss a change."
                        />
                        <FeatureCard
                            icon={Users}
                            title="Multi-User Assignments"
                            desc="Assign tasks to entire teams. Track individual acceptance metrics before moving to In-Progress."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Lightning Fast UI"
                            desc="Optimized React rendering with Framer Motion animations ensures a buttery-smooth experience."
                        />
                        <FeatureCard
                            icon={CheckCircle}
                            title="Lifespan Visualizer"
                            desc="Custom progress bars show exactly how long a task has been sitting in the To-Do queue."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Enterprise Security"
                            desc="JWT Authentication, HttpOnly cookies, and strict Role-Based Access Controls protect your data."
                        />
                    </div>
                </div>
            </section>

            {/* Admin Showcase Section */}
            <section className="py-24 relative z-10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-text-main">
                                Complete Control for <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Administrators</span>
                            </h2>
                            <p className="text-lg text-text-muted leading-relaxed">
                                Primetrade isn't just a task board—it's a complete team management solution. Admins gain exclusive access to a global overview, allowing them to instantly pinpoint bottlenecks.
                            </p>
                            <ul className="space-y-4">
                                <ListItem text="Global analytics banner visualizing task metrics across the organization." />
                                <ListItem text="Dedicated User Management portal to create, edit, or suspend team members." />
                                <ListItem text="Strict status constraints ensure Users are held accountable for dragging tasks." />
                                <ListItem text="Approve task requests directly from lower-level staff." />
                            </ul>
                            <Link to="/admin/login" className="inline-flex items-center gap-2 text-indigo-500 font-semibold hover:text-indigo-400 transition-colors mt-4">
                                <Lock className="w-4 h-4" />
                                Go to Admin Portal <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="flex-1 w-full lg:w-auto relative">
                            {/* Decorative mock element */}
                            <div className="aspect-square max-w-md mx-auto relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-primary-500/20 rounded-3xl blur-2xl"></div>
                                <div className="glass-card absolute inset-4 border border-white/10 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
                                    <div className="space-y-4">
                                        <div className="h-4 w-1/3 bg-surface rounded animate-pulse"></div>
                                        <div className="h-10 w-full bg-surface/50 rounded-lg border border-border-main"></div>
                                        <div className="h-10 w-full bg-surface/50 rounded-lg border border-border-main delay-75"></div>
                                        <div className="h-10 w-5/6 bg-surface/50 rounded-lg border border-border-main delay-150"></div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-border-main flex justify-between items-center">
                                        <div className="flex -space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-primary-500/50 border-2 border-background"></div>
                                            <div className="w-8 h-8 rounded-full bg-purple-500/50 border-2 border-background"></div>
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/50 border-2 border-background"></div>
                                        </div>
                                        <div className="h-8 w-24 bg-primary-500/20 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-20 bg-gradient-to-b from-transparent to-surface/50 border-t border-border-main relative z-10">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-6">Ready to transform your workflow?</h2>
                    <p className="text-lg text-text-muted mb-8">Join the Primetrade ecosystem today and experience task management without the friction.</p>
                    <Link to="/user/register" className="btn-primary px-10 py-4 text-lg !w-auto inline-flex shadow-lg shadow-primary-500/25">
                        Start your journey
                    </Link>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="glass-card flex flex-col items-start text-left p-6 hover:-translate-y-1 transition-transform duration-300">
        <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-5 border border-primary-500/20">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-text-main mb-2 tracking-tight">{title}</h3>
        <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
    </div>
);

const ListItem = ({ text }) => (
    <li className="flex items-start gap-3">
        <div className="mt-1 bg-indigo-500/10 p-1 rounded text-indigo-500 shrink-0">
            <CheckCircle className="w-4 h-4" />
        </div>
        <span className="text-text-main">{text}</span>
    </li>
);

export default LandingPage;
