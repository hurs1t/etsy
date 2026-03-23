export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white text-gray-900 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Privacy Policy</h1>
                    <p className="text-slate-500 font-medium whitespace-nowrap">Last Updated: March 22, 2026</p>
                </div>

                <div className="space-y-10 text-lg leading-relaxed text-slate-700">
                    <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">01</span>
                            Introduction
                        </h2>
                        <p>
                            Welcome to EtsyAuto. We value your privacy and are committed to protecting your personal data.
                            This privacy policy informs you how we handle your data when you use our Chrome extension and web dashboard.
                        </p>
                    </section>

                    <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">02</span>
                            Data We Collect
                        </h2>
                        <div className="space-y-4">
                            <p>When you use the EtsyAuto Chrome extension, we collect and store:</p>
                            <ul className="list-disc pl-6 space-y-2 font-medium">
                                <li><strong className="text-slate-900">Contact Data:</strong> Your email and name for account management.</li>
                                <li><strong className="text-slate-900">Authentication Data:</strong> Secure JWT tokens stored in your browser's local storage.</li>
                                <li><strong className="text-slate-900">Website Content:</strong> Product information (text and images) scraped from pages you visit specifically for listing generation.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">03</span>
                            How We Use Data
                        </h2>
                        <p>
                            We use your information exclusively to operate the EtsyAuto service, manage your platform usage,
                            and facilitate the generation and synchronization of product listings to your Etsy account using our AI models.
                        </p>
                    </section>

                    <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
                            <span className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">04</span>
                            Third-Party Disclosure
                        </h2>
                        <p>
                            We use trusted third-party services like OpenAI and Fal.ai to generate optimized listings and
                            enhance images. We do not sell your personal data to any third party.
                        </p>
                    </section>

                    <section className="bg-orange-50 p-8 rounded-3xl border border-orange-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-orange-900 mb-4">Gizlilik Politikası (Özet)</h2>
                        <p className="text-orange-800 font-medium">
                            EtsyAuto olarak gizliliğinize önem veriyoruz. Eklentimiz ve web panelimiz aracılığıyla toplanan
                            veriler (e-posta, ad ve ürün bilgileri) sadece eklentinin temel işlevlerini yerine getirmesi
                            ve size daha iyi bir listeleme deneyimi sunmak için kullanılır. Verileriniz asla satılmaz
                            veya izinsiz paylaşılmaz.
                        </p>
                    </section>
                </div>

                <div className="mt-16 text-center">
                    <a href="/" className="inline-flex items-center text-primary font-bold hover:text-orange-600 transition-colors uppercase tracking-widest text-sm">
                        &larr; Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
