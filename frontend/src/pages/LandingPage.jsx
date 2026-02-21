import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, LayoutDashboard, CheckCircle, Users, Activity, Lock, BarChart, Clock, PlayCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div className="flex flex-col w-full min-h-screen overflow-x-hidden selection:bg-primary-500/30">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 -z-50 overflow-hidden bg-background">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Hero Section */}
            <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-20 px-4 sm:px-6 lg:px-8 text-center border-b border-border-main/50 overflow-hidden">
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBMMDAgMEw0MCAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBMMDAgMEw0MCAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-40 mix-blend-overlay"></div>

                <motion.div
                    initial="hidden" animate="visible" variants={staggerContainer}
                    style={{ y: yHero, opacity: opacityHero }}
                    className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        Now live
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-text-main mb-6 leading-[0.9] drop-shadow-sm">
                        Work <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-500 to-indigo-500 via-purple-500 animate-gradient-x">Faster.</span><br />
                        Scale <span className="italic font-serif text-text-muted">Smarter.</span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="mt-6 max-w-2xl text-xl md:text-2xl text-text-muted mb-10 mx-auto leading-relaxed">
                        The ultimate high-performance task management ecosystem built for elite teams who refuse to compromise on speed.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto px-4 items-center">
                        <Link to="/register" className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-primary-600 border border-transparent rounded-2xl hover:bg-primary-500 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 overflow-hidden w-full sm:w-auto">
                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                            <span className="relative flex items-center gap-2">
                                Start Building Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <div className="flex gap-4 w-full sm:w-auto">
                            <Link to="/login" className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 text-base font-medium text-text-main transition-all duration-200 bg-surface border border-border-main rounded-2xl hover:bg-surface-hover hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none">
                                Sign In
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Decorative Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-20"></div>
            </section>

            {/* Social Proof / Trusted By */}
            <section className="py-12 border-b border-border-main/50 bg-surface/30">
                <div className="max-w-7xl mx-auto px-4 overflow-hidden">
                    <p className="text-center text-sm font-semibold tracking-wider text-text-muted uppercase mb-8">Trusted by innovative teams worldwide</p>
                    <div className="flex justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap">
                        {/* Mock Logos - simple text for UI purposes since we don't have SVGs */}
                        <div className="text-xl font-bold flex items-center gap-2 text-text-main"><Zap className="w-6 h-6" /> BoltCo</div>
                        <div className="text-xl font-black italic flex items-center gap-2 text-text-main"><Activity className="w-6 h-6" /> Nexus</div>
                        <div className="text-xl font-serif flex items-center gap-2 text-text-main"><LayoutDashboard className="w-6 h-6" /> BlockTech</div>
                        <div className="text-xl font-mono flex items-center text-text-main">{'<Acme/>'}</div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="py-32 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-text-main mb-6">Everything you need. <br className="hidden md:block" />Nothing you don't.</h2>
                    <p className="text-xl text-text-muted max-w-2xl mx-auto">We stripped away the clutter to leave only the features that actually accelerate your workflow.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[300px]">
                    {/* Large Feature 1 */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="md:col-span-2 md:row-span-1 glass-card rounded-3xl p-8 flex flex-col md:flex-row gap-8 overflow-hidden group relative border border-border-main hover:border-primary-500/50 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="flex-1 flex flex-col justify-center z-10">
                            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-6">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-main mb-3">Interactive Kanban</h3>
                            <p className="text-text-muted leading-relaxed">Drag and drop tasks across columns seamlessly. Visual progress tracking keeps you focused, while WebSockets ensure everyone sees updates instantly.</p>
                        </div>
                        {/* Decorative UI element */}
                        <div className="flex-1 w-full bg-surface/50 rounded-2xl border border-border-main p-4 shadow-inner flex gap-3 transform group-hover:rotate-1 group-hover:scale-105 transition-all duration-500">
                            <div className="flex-1 bg-background rounded-xl p-3 space-y-3 shadow-sm border border-border-main/50">
                                <div className="h-2 w-12 bg-gray-500/20 rounded"></div>
                                <div className="h-16 w-full bg-surface rounded-lg border border-border-main/50"></div>
                                <div className="h-16 w-full bg-surface rounded-lg border border-border-main/50"></div>
                            </div>
                            <div className="flex-1 bg-background rounded-xl p-3 space-y-3 shadow-sm border border-border-main/50">
                                <div className="h-2 w-12 bg-primary-500/20 rounded"></div>
                                <div className="h-16 w-full bg-primary-500/10 rounded-lg border border-primary-500/20 shadow-[0_0_15px_rgba(var(--color-primary-500),0.15)]"></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Small Feature 1 */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.1 }}
                        className="md:col-span-1 md:row-span-1 glass-card rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative border border-border-main hover:border-purple-500/50 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="z-10">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-text-main mb-3">Live Feed</h3>
                            <p className="text-text-muted text-sm">Every action is cataloged in a real-time event stream. Never wonder what changed while you were away.</p>
                        </div>
                        <div className="mt-6 flex flex-col gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="h-8 w-full bg-surface/80 rounded-lg border border-border-main flex items-center px-3 gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <div className="h-2 w-3/4 bg-gray-500/20 rounded"></div>
                            </div>
                            <div className="h-8 w-5/6 bg-surface/80 rounded-lg border border-border-main opacity-50 flex items-center px-3 gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="h-2 w-1/2 bg-gray-500/20 rounded"></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Small Feature 2 */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.2 }}
                        className="md:col-span-1 md:row-span-1 glass-card rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative border border-border-main hover:border-emerald-500/50 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="z-10">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-text-main mb-3">Team Sync</h3>
                            <p className="text-text-muted text-sm">Assign tasks to multiple users. Built-in mechanisms to take initiative and accept responsibilities.</p>
                        </div>
                        <div className="flex -space-x-4 justify-end mt-4 transform translate-x-4 group-hover:translate-x-0 transition-transform duration-500 relative z-10 p-2">
                            <div className="w-12 h-12 rounded-full border-4 border-background bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-xl"></div>
                            <div className="w-12 h-12 rounded-full border-4 border-background bg-gradient-to-tr from-blue-400 to-indigo-500 shadow-xl"></div>
                            <div className="w-12 h-12 rounded-full border-4 border-background bg-surface flex items-center justify-center text-xs font-bold text-text-main shadow-xl">+3</div>
                        </div>
                    </motion.div>

                    {/* Large Feature 2 */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.3 }}
                        className="md:col-span-2 md:row-span-1 glass-card rounded-3xl p-8 flex flex-col md:flex-row-reverse gap-8 overflow-hidden group relative border border-border-main hover:border-indigo-500/50 transition-colors"
                    >
                        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="flex-1 flex flex-col justify-center z-10">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
                                <BarChart className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-main mb-3">Admin Overview</h3>
                            <p className="text-text-muted leading-relaxed">A dedicated portal giving you a bird's-eye view of your entire organization. Spot bottlenecks instantly with visual metrics and full user control.</p>
                        </div>
                        <div className="flex-1 w-full bg-surface/50 rounded-2xl border border-border-main p-6 shadow-inner flex flex-col justify-end gap-2 transform group-hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-4 left-4 right-4 flex justify-between">
                                <div className="h-6 w-1/3 bg-background rounded border border-border-main"></div>
                                <div className="h-6 w-1/4 bg-indigo-500/20 rounded border border-indigo-500/30"></div>
                            </div>
                            {/* Bar Chart Mockup */}
                            <div className="flex items-end gap-2 h-24 mt-8 w-full justify-between px-2">
                                <div className="w-full bg-indigo-500/80 rounded-t-sm" style={{ height: '40%' }}></div>
                                <div className="w-full bg-indigo-500/60 rounded-t-sm" style={{ height: '70%' }}></div>
                                <div className="w-full bg-indigo-500 rounded-t-sm shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ height: '100%' }}></div>
                                <div className="w-full bg-indigo-500/40 rounded-t-sm" style={{ height: '30%' }}></div>
                                <div className="w-full bg-indigo-500/70 rounded-t-sm" style={{ height: '80%' }}></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Performance Banner */}
            <section className="py-24 relative overflow-hidden text-center -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 border-y border-border-main bg-background/50 backdrop-blur-3xl py-16">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-500 mb-6 border border-amber-500/20">
                        <Zap className="w-8 h-8" />
                    </motion.div>
                    <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-7xl font-black text-text-main mb-6 tracking-tighter">
                        Absurdly <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">fast.</span>
                    </motion.h2>
                    <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.2 }} className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto font-medium">
                        No loading spinners. No optimistic UI bugs. Just raw performance powered by React and an optimized Node.js backend.
                    </motion.p>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-32 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-text-main mb-6">Simple, transparent pricing.</h2>
                    <p className="text-xl text-text-muted max-w-2xl mx-auto">Start for free, upgrade when your team needs more power.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="glass-card rounded-3xl p-8 flex flex-col relative border border-border-main hover:border-text-muted transition-colors"
                    >
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-text-main mb-2">Starter</h3>
                            <p className="text-text-muted h-12">Perfect for individuals and small teams just getting started.</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-5xl font-black text-text-main">$0</span>
                            <span className="text-text-muted">/ forever</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-text-main"><CheckCircle className="w-5 h-5 text-emerald-500" /> Up to 5 team members</li>
                            <li className="flex items-center gap-3 text-text-main"><CheckCircle className="w-5 h-5 text-emerald-500" /> Basic Kanban boards</li>
                            <li className="flex items-center gap-3 text-text-main"><CheckCircle className="w-5 h-5 text-emerald-500" /> Community support</li>
                        </ul>
                        <Link to="/register" className="btn-secondary w-full justify-center py-4 rounded-xl">Get Started</Link>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.1 }}
                        className="glass-card rounded-3xl p-8 flex flex-col relative border-2 border-primary-500 shadow-[0_0_40px_rgba(var(--color-primary-500),0.15)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Most Popular</div>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none"></div>
                        <div className="mb-8 relative z-10">
                            <h3 className="text-2xl font-bold text-text-main mb-2">Professional</h3>
                            <p className="text-text-muted h-12">For growing teams that need advanced control and analytics.</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2 relative z-10">
                            <span className="text-5xl font-black text-text-main">$12</span>
                            <span className="text-text-muted">/ user / month</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 relative z-10">
                            <li className="flex items-center gap-3 text-text-main"><CheckCircle className="w-5 h-5 text-primary-500" /> Unlimited team members</li>
                            <li className="flex items-center gap-3 text-text-main"><CheckCircle className="w-5 h-5 text-primary-500" /> Advanced Admin portal</li>
                            <li className="flex items-center gap-3 text-text-main"><CheckCircle className="w-5 h-5 text-primary-500" /> Real-time activity feeds</li>
                            <li className="flex items-center gap-3 text-text-main"><CheckCircle className="w-5 h-5 text-primary-500" /> Priority 24/7 support</li>
                        </ul>
                        <Link to="/register" className="btn-primary w-full justify-center py-4 rounded-xl relative z-10">Start Free Trial</Link>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 relative z-10 bg-surface/30 border-y border-border-main">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-text-main mb-4">Frequently Asked Questions</h2>
                        <p className="text-lg text-text-muted">Everything you need to know about Primetrade.</p>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
                        className="space-y-4"
                    >
                        {[
                            { q: "Is there a free trial for the Professional plan?", a: "Yes! You can try the Professional plan completely free for 14 days. No credit card required." },
                            { q: "How secure is my team's data?", a: "Security is our highest priority. We use industry-standard encryption, secure HttpOnly cookies for JWT authentication, and strict role-based access controls." },
                            { q: "Can I manage permissions for different users?", a: "Absolutely. Our Administrator portal allows you to invite users, assign them to specific roles, and suspend accounts if necessary." },
                            { q: "Do you offer custom enterprise pricing?", a: "We do. If you have a team of over 50 people, please contact our sales team for tailored pricing and dedicated deployment options." }
                        ].map((faq, i) => (
                            <motion.div key={i} variants={fadeInUp} className="glass-card rounded-2xl p-6 border border-border-main">
                                <h4 className="text-lg font-bold text-text-main mb-2">{faq.q}</h4>
                                <p className="text-text-muted leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-32 relative z-10 w-full text-center border-t border-border-main/50 bg-gradient-to-b from-background to-surface/30">
                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                    className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-8"
                >
                    <div className="relative z-10 w-full flex flex-col items-center">
                        <h2 className="text-5xl md:text-7xl font-black text-text-main mb-6 tracking-tighter">
                            Start organizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">today.</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto font-medium">
                            Join thousands of teams who have already upgraded their task management workflow without the friction.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full justify-center mt-6">
                        <Link to="/register" className="btn-primary px-10 py-5 text-lg font-bold w-full sm:w-auto shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 rounded-2xl hover:-translate-y-1 transition-all">
                            Create Free Account <ArrowRight className="w-5 h-5 ml-2 inline" />
                        </Link>
                        <Link to="/login" className="btn-secondary px-10 py-5 text-lg font-bold w-full sm:w-auto bg-surface/50 hover:bg-surface rounded-2xl border border-border-main hover:-translate-y-1 transition-all">
                            Sign In
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Clean Footer */}
            <footer className="py-12 border-t border-border-main bg-background relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-text-main">
                        <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-lg flex items-center justify-center text-white">
                            P
                        </div>
                        Primetrade<span className="text-primary-500">.</span>
                    </div>

                    <div className="flex gap-8 text-sm font-medium text-text-muted">
                        <Link to="/" className="hover:text-text-main transition-colors">Home</Link>
                        <Link to="/login" className="hover:text-text-main transition-colors">Login</Link>
                        <Link to="/register" className="hover:text-text-main transition-colors">Sign Up</Link>
                    </div>

                    <div className="text-sm text-text-muted/60">
                        &copy; {new Date().getFullYear()} Primetrade. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
