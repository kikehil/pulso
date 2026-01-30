'use client';

import { Mail, MessageSquare, Clock, Search } from 'lucide-react';

export default function TeacherMessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">Mensajería</h1>
          <p className="text-gray mt-1">Comunícate con tus alumnos y colegas</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Nuevo Mensaje
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Lista de Chats */}
        <div className="lg:col-span-1 card p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
              <input
                type="text"
                placeholder="Buscar chats..."
                className="w-full pl-10 pr-4 py-2 bg-light border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-4 border-b hover:bg-light cursor-pointer transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">A{i}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-dark text-sm truncate">Alumno Ejemplo {i}</h4>
                    <span className="text-[10px] text-gray whitespace-nowrap">10:45 AM</span>
                  </div>
                  <p className="text-xs text-gray truncate">Profesor, tengo una duda sobre la tarea de hoy...</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ventana de Chat (Estado Vacío) */}
        <div className="lg:col-span-2 card flex flex-col items-center justify-center text-center p-12">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-10 h-10 text-primary/30" />
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">Selecciona un chat</h3>
          <p className="text-gray max-w-xs">
            Elige una conversación de la lista de la izquierda para comenzar a mensajear.
          </p>
        </div>
      </div>
    </div>
  );
}

