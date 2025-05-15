import React from "react";
import Link from "next/link";
import { useRouter } from 'next/router';
import { cn } from "../lib/utils";
import { Button } from "../components/Button";
import { Toaster } from "../components/Toaster";
import { Home, Bell, Settings, LifeBuoy, Menu, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = [
    { href: "/", label: "Tableau de bord", icon: Home },
    { href: "/n8n", label: "Gestion n8n", icon: Bell },
    { href: "/config", label: "Configuration", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return router.pathname === "/";
    }
    return router.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar pour mobile */}
      <div className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">SOS System</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-6 left-6 right-6">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              asChild
            >
              <Link href="/help">
                <LifeBuoy className="h-4 w-4 mr-2" />
                Aide & Support
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar pour desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col h-full border-r bg-background px-6 py-8">
          <h2 className="text-xl font-bold mb-8">SOS System</h2>
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            asChild
          >
            <Link href="/help">
              <LifeBuoy className="h-4 w-4 mr-2" />
              Aide & Support
            </Link>
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Barre supérieure pour mobile */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b h-16 px-6 bg-background lg:hidden">
          <h2 className="text-lg font-bold">SOS System</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Contenu */}
        <main className="flex-1">{children}</main>
      </div>
      
      {/* Toaster pour les notifications */}
      <Toaster />
    </div>
  );
}