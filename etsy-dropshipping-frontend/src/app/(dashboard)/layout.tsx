import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80] bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800">
                <Sidebar />
            </div>
            <main className="md:pl-64">
                <Header />
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
