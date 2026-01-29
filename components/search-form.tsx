'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchFormProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchForm({ 
  placeholder = "Buscar estudiantes...", 
  onSearch 
}: SearchFormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-3">
        {/* Input de Búsqueda - Estilo PulseTec */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="input-field pl-11 pr-4 font-regular"
          />
        </div>

        {/* Botón de Búsqueda - Estilo PulseTec */}
        <button
          type="submit"
          className="btn-primary px-6 shadow-lg shadow-primary/20"
        >
          Buscar
        </button>

        {/* Botón de Filtros */}
        <button
          type="button"
          className="btn-secondary px-4"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Estado de búsqueda */}
      {query && (
        <p className="mt-2 text-sm text-gray font-regular">
          Buscando: <span className="font-medium text-dark">{query}</span>
        </p>
      )}
    </form>
  );
}


