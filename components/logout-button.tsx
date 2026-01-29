'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await signOut({ callbackUrl: '/login' });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-gray hover:text-primary hover:bg-light rounded-lg transition-all duration-200 disabled:opacity-50"
      title="Cerrar Sesión"
    >
      <LogOut className="w-5 h-5" />
      <span className="text-sm font-medium">Cerrar Sesión</span>
    </button>
  );
}


