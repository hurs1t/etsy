export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-4">
            <h1 className="text-3xl font-black mb-6 text-slate-900 dark:text-white">Privacy Policy</h1>
            <p className="text-slate-500 mb-8 font-medium">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-8 text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                <section className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold mb-3 text-primary">1. Information We Collect</h2>
                    <p>We only collect the information necessary to provide our services. This includes your account information (email, name) and the data required to connect to your Etsy store securely.</p>
                </section>

                <section className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold mb-3 text-primary">2. How We Use Your Information</h2>
                    <p>We use your information exclusively to operate the EtsySync service, manage your platform usage, and facilitate the generation and synchronization of product listings to your Etsy account using our AI models.</p>
                </section>

                <section className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold mb-3 text-primary">3. Third-Party Access</h2>
                    <p>We use trusted third-party services like OpenAI and Fal.ai to generate optimized listings (text) and enhance images. We do not sell your personal data to any third party.</p>
                </section>

                <section className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold mb-3 text-primary">4. Data Security</h2>
                    <p>We implement industry-standard security measures, including bcrypt password hashing and token-based authentication, to protect your account. However, no absolute guarantee of transmission security over the Internet can be provided.</p>
                </section>
            </div>

            <div className="mt-12 text-sm font-bold">
                <a href="/" className="text-primary hover:underline hover:text-orange-600 transition-colors uppercase tracking-widest">&larr; Back to Home</a>
            </div>
        </div>
    );
}
