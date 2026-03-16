export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto py-16 px-4">
            <h1 className="text-3xl font-black mb-6 text-slate-900 dark:text-white">Terms of Service</h1>
            <p className="text-slate-500 mb-8 font-medium">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-8 text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                <section className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold mb-3 text-primary">1. Acceptance of Terms</h2>
                    <p>By accessing and using EtsySync (the Chrome Extension and Web Dashboard), you accept and agree to be bound by the terms and provision of this agreement.</p>
                </section>

                <section className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold mb-3 text-primary">2. Service Usage & Limits</h2>
                    <p>EtsySync currently operates as a limited service with a strict maximum user cap of 100 registered accounts. Access may be revoked if the service is used for malicious activities, scraping abuse, or violations of Etsy's Terms of Use.</p>
                </section>

                <section className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold mb-3 text-primary">3. User Accounts</h2>
                    <p>You are responsible for safeguarding your account credentials. You are strictly prohibited from sharing your account or abusing the provided AI credits and endpoints.</p>
                </section>

                <section className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold mb-3 text-primary">4. Disclaimer of Warranties</h2>
                    <p>The Service is provided on an "as is" and "as available" basis without any warranty or condition, express, implied, or statutory. We reserve the right to modify or discontinue the service at any time.</p>
                </section>
            </div>

            <div className="mt-12 text-sm font-bold">
                <a href="/" className="text-primary hover:underline hover:text-orange-600 transition-colors uppercase tracking-widest">&larr; Back to Home</a>
            </div>
        </div>
    );
}
