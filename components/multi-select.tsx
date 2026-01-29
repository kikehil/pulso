'use client';

import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

/**
 * Multi-Select Component - Estilo PulseTec Control
 * - Dropdown con checkboxes
 * - Badges para items seleccionados
 * - Búsqueda integrada
 */
export function MultiSelect({
  options,
  selected = [], // ✓ Default a array vacío
  onChange,
  placeholder = 'Seleccionar...',
  label,
  required = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // ✓ Asegurar que selected sea siempre un array
  const safeSelected = Array.isArray(selected) ? selected : [];

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOptions = options.filter((option) =>
    safeSelected.includes(option.value)
  );

  const toggleOption = (value: string) => {
    if (safeSelected.includes(value)) {
      onChange(safeSelected.filter((v) => v !== value));
    } else {
      onChange([...safeSelected, value]);
    }
  };

  const removeOption = (value: string) => {
    onChange(safeSelected.filter((v) => v !== value));
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-dark mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Selected Items */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {option.label}
              <button
                type="button"
                onClick={() => removeOption(option.value)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full input-field flex items-center justify-between',
          isOpen && 'border-primary ring-2 ring-primary/20'
        )}
      >
        <span className={cn('text-sm', !selectedOptions.length && 'text-gray')}>
          {selectedOptions.length > 0
            ? `${selectedOptions.length} seleccionado${selectedOptions.length > 1 ? 's' : ''}`
            : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-3 py-2 text-sm border border-gray rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options */}
            <div className="overflow-y-auto max-h-60">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray">
                  No se encontraron opciones
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = safeSelected.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption(option.value)}
                      className="w-full flex items-start gap-3 p-3 hover:bg-light transition-colors text-left"
                    >
                      <div
                        className={cn(
                          'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-gray'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark">
                          {option.label}
                        </p>
                        {option.description && (
                          <p className="text-xs text-gray mt-0.5">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
