'use client';

import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  required?: boolean;
  minDate?: string;
}

/**
 * DatePicker Component - Estilo PulseTec Control
 * - Input de fecha nativo limpio
 * - Icono de calendario
 * - Validación de fecha mínima
 */
export function DatePicker({
  value,
  onChange,
  label,
  required = false,
  minDate,
}: DatePickerProps) {
  // Formato: YYYY-MM-DDTHH:MM
  const today = new Date().toISOString().slice(0, 16);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-dark mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          min={minDate || today}
          className="input-field pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Calendar className="w-5 h-5 text-gray" />
        </div>
      </div>

      <p className="text-xs text-gray mt-1">
        Selecciona fecha y hora de vencimiento
      </p>
    </div>
  );
}


