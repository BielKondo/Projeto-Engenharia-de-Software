import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
