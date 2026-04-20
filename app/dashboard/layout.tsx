import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen w-full lg:pl-64">
        <Header />
        <main className="flex-1 py-6 px-4 sm:py-8 sm:px-6 lg:py-8 lg:px-8 w-full max-w-full lg:max-w-7xl mx-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
