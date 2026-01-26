import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  cartItemCount?: number;
  /** Use full width without side margins */
  fullWidth?: boolean;
}

export function MainLayout({ children, cartItemCount = 0, fullWidth = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header cartItemCount={cartItemCount} />
      <main className="flex-1">
        {fullWidth ? (
          children
        ) : (
          <div className="max-w-7xl mx-auto w-full px-4 lg:px-8">
            {children}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;

