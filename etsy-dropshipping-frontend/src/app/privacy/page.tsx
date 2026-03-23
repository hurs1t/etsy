import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-sans">
            {/* Header / Hero Section */}
            <header className="py-20 px-6 sm:px-12 lg:px-24 bg-white border-b border-[#eeeeee]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-[#a13a00] text-xs font-bold tracking-widest uppercase mb-6">
                            Security & Trust
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#1a1c1c] mb-4">
                            Privacy <span className="text-[#a13a00]">Policy</span>
                        </h1>
                        <p className="text-xl text-[#594138] font-medium max-w-2xl">
                            Your data privacy is our primary commitment. We build tools that empower merchants, not compromise them.
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-[#8d7166] uppercase tracking-tighter">Last Updated</p>
                        <p className="text-lg font-black text-[#1a1c1c]">March 22, 2026</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-16 px-6 sm:px-12 lg:px-24 flex flex-col lg:flex-row gap-16">
                {/* Anti-Asymmetric Side Navigation */}
                <aside className="lg:w-64 flex-shrink-0">
                    <nav className="sticky top-8 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#8d7166] mb-6 pl-4">Contents</p>
                        {[
                            { id: 'collect', label: 'What we collect' },
                            { id: 'use', label: 'How we use it' },
                            { id: 'rights', label: 'Your Rights & Control' },
                            { id: 'cookies', label: 'Cookie Policy' },
                            { id: 'contact', label: 'Questions?' }
                        ].map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="block py-3 px-4 rounded-xl text-sm font-bold text-[#594138] hover:bg-[#eeeeee] hover:text-[#a13a00] transition-all duration-200 border-l-2 border-transparent hover:border-[#a13a00]"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Content Sections */}
                <div className="flex-1 space-y-24">

                    <section id="collect" className="scroll-mt-12 group">
                        <h2 className="text-3xl font-black text-[#1a1c1c] mb-8 flex items-baseline gap-4">
                            <span className="text-[10px] uppercase tracking-widest text-[#a13a00] font-black opacity-40 group-hover:opacity-100 transition-opacity underline decoration-4">01</span>
                            What we collect
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                {
                                    title: 'Account Information',
                                    desc: 'When you register, we collect your name, email address, and shop URL. This is used to create your unique merchant profile and facilitate communication.'
                                },
                                {
                                    title: 'Authentication Tokens',
                                    desc: 'Our Chrome extension uses OAuth tokens to securely communicate with Etsy\'s servers. We store these encrypted tokens to maintain your automation cycles without repeated logins.'
                                },
                                {
                                    title: 'Operational Metadata',
                                    desc: 'We record listing success rates, sync times, and error logs. This data is anonymized and used exclusively to improve the performance of our automation algorithms.'
                                }
                            ].map((card, i) => (
                                <div key={i} className="bg-white p-8 rounded-3xl border border-[#eeeeee] hover:border-[#e1bfb3] transition-colors shadow-sm">
                                    <h3 className="text-lg font-black text-[#1a1c1c] mb-3 uppercase tracking-tight">{card.title}</h3>
                                    <p className="text-[#594138] leading-relaxed font-medium">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="use" className="scroll-mt-12 group">
                        <h2 className="text-3xl font-black text-[#1a1c1c] mb-12 flex items-baseline gap-4">
                            <span className="text-[10px] uppercase tracking-widest text-[#a13a00] font-black opacity-40 group-hover:opacity-100 transition-opacity underline decoration-4">02</span>
                            How we use your information
                        </h2>
                        <div className="bg-[#f3f3f3] p-1 rounded-[2.5rem]">
                            <div className="bg-white p-12 rounded-[2.25rem] shadow-inner space-y-12">
                                {[
                                    { title: 'To Automate', desc: 'Managing inventory, updating tags, and syncing listings across multiple platforms automatically.' },
                                    { title: 'To Communicate', desc: 'Sending security alerts, system updates, and merchant success reports via your registered email.' },
                                    { title: 'To Improve', desc: 'Analyzing platform-wide usage patterns to develop new features that save you more time.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0 text-[#a13a00] font-black">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-[#1a1c1c] mb-2">{item.title}</h4>
                                            <p className="text-[#8d7166] text-lg font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="rights" className="scroll-mt-12 group">
                        <h2 className="text-3xl font-black text-[#1a1c1c] mb-8 flex items-baseline gap-4">
                            <span className="text-[10px] uppercase tracking-widest text-[#a13a00] font-black opacity-40 group-hover:opacity-100 transition-opacity underline decoration-4">03</span>
                            Your Rights & Control
                        </h2>
                        <p className="text-[#594138] text-lg font-medium mb-12 max-w-2xl">
                            As a global service, we honor privacy standards such as GDPR and CCPA, ensuring every user has total control over their data.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { title: 'Right to Access', desc: 'Request a complete export of all data EtsyAuto holds regarding your account.' },
                                { title: 'Right to Rectification', desc: 'Correct any inaccurate or incomplete personal information at any time via settings.' },
                                { title: 'Right to Erasure', desc: 'Request the permanent deletion of your account and all associated operational data.' },
                                { title: 'Right to Object', desc: 'Opt-out of any data processing activities used for analytics or marketing.' }
                            ].map((card, i) => (
                                <div key={i} className="group/card bg-white p-6 rounded-2xl border border-transparent hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300">
                                    <h3 className="text-primary font-black mb-2 uppercase tracking-widest text-[13px]">{card.title}</h3>
                                    <p className="text-sm font-medium text-[#8d7166] leading-relaxed">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="cookies" className="scroll-mt-12 group">
                        <div className="bg-white/70 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/50 shadow-2xl">
                            <h2 className="text-3xl font-black text-[#1a1c1c] mb-6 flex items-baseline gap-4">
                                <span className="text-[10px] uppercase tracking-widest text-[#a13a00] font-black opacity-40 group-hover:opacity-100 transition-opacity underline decoration-4">04</span>
                                Cookie Policy
                            </h2>
                            <p className="text-[#594138] text-lg font-medium leading-relaxed mb-10">
                                We use tokens and limited cookies to identify your session. These are essential for the operation of the dashboard and Chrome extension.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-[#f9f9f9] p-4 rounded-2xl">
                                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    <p className="text-sm font-black uppercase text-[#1a1c1c]">Essential Cookies: ACTIVE</p>
                                </div>
                                <div className="flex items-center gap-4 bg-[#f9f9f9] p-4 rounded-2xl">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    <p className="text-sm font-black uppercase text-[#1a1c1c]">Analytics Cookies: ACTIVE</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="contact" className="scroll-mt-12 pt-12">
                        <div className="bg-[#1a1c1c] text-white p-12 rounded-[3rem] overflow-hidden relative group">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black mb-4">Questions about your privacy?</h2>
                                <p className="text-slate-400 font-medium mb-8 max-w-md">Our data protection officer is available to help you understand how your information is handled.</p>
                                <a
                                    href="mailto:privacy@etsyauto.io"
                                    className="inline-block px-10 py-5 bg-[#a13a00] hover:bg-[#ca4b00] rounded-full text-lg font-black transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    Contact Privacy Team
                                </a>
                            </div>
                            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[#a13a00] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        </div>
                    </section>

                </div>
            </main>

            <footer className="bg-white border-t border-[#eeeeee] py-16 px-6 sm:px-12 lg:px-24">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[#8d7166] font-bold text-sm">
                    <p>© 2026 EtsyAuto. Precision for Merchants.</p>
                    <div className="flex gap-8">
                        <a href="/terms" className="hover:text-[#a13a00] transition-colors uppercase tracking-widest">Terms</a>
                        <a href="/privacy" className="text-[#a13a00] transition-colors uppercase tracking-widest pointer-events-none">Privacy</a>
                        <a href="/security" className="hover:text-[#a13a00] transition-colors uppercase tracking-widest">Security</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
