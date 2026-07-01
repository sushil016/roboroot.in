/**
 * Layout Wrapper Component
 * Client component wrapper for Header and Footer
 */

'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { ChatWidget } from '@/features/chat';
import { SideRays } from '@/components/SideRays';

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/callback'];

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isHome = pathname === '/';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] relative">
      {isHome && (
        <div className="absolute top-0 left-0 w-full h-[650px] pointer-events-none z-0 overflow-hidden opacity-35">
          <SideRays
            origin="top-right"
            rayColor1="#1CA2D1"
            rayColor2="#EAB308"
            intensity={2.2}
            speed={1.2}
            spread={2.0}
            tilt={12}
            opacity={0.9}
          />
        </div>
      )}
      <CommandPalette />
      <Header />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
