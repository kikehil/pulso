# 📦 Instrucciones para Instalar Dependencias

## 🚨 IMPORTANTE: Debes seguir estos pasos

El sistema de **Calificaciones y Reportes** está completamente implementado, pero necesita 3 librerías adicionales para funcionar:

---

## 📋 Paso a Paso

### 1️⃣ Detener el Servidor

Si tienes el servidor corriendo (`npm run dev`), deténlo primero:

```bash
Ctrl + C
```

---

### 2️⃣ Instalar las Dependencias

Ejecuta este comando en la terminal:

```bash
npm install jspdf jspdf-autotable xlsx
```

**¿Qué instala cada librería?**
- `jspdf`: Genera archivos PDF en el navegador
- `jspdf-autotable`: Plugin para crear tablas profesionales en PDFs
- `xlsx`: Genera y exporta archivos Excel (.xlsx)

---

### 3️⃣ Reiniciar el Servidor

Una vez instaladas las dependencias, reinicia el servidor:

```bash
npm run dev
```

---

## ✅ Verificar la Instalación

Después de instalar, abre tu navegador y:

1. Ve a `/teacher/dashboard`
2. Click en cualquier grupo (ej: "CONTADOR")
3. Click en el tab **"Reportes"**
4. Intenta generar un reporte:
   - **PDF de Asistencia**: Debe descargar un archivo `.pdf`
   - **Excel de Calificaciones**: Debe descargar un archivo `.xlsx`

Si se descargan correctamente, ¡todo está funcionando! 🎉

---

## ❌ Si Aparece un Error

Si ves un mensaje como:

> ⚠️ Necesitas instalar las dependencias:
> npm install jspdf jspdf-autotable xlsx

Significa que las librerías no están instaladas. Repite el **Paso 2**.

---

## 🔧 Problemas Comunes

### Error: `EPERM: operation not permitted`

**Causa**: El servidor está corriendo y bloquea la instalación.

**Solución**:
1. Detén el servidor (Ctrl+C)
2. Vuelve a ejecutar `npm install jspdf jspdf-autotable xlsx`

---

### Error: `ERR_SSL_CIPHER_OPERATION_FAILED`

**Causa**: Problema con el registro de npm.

**Soluciones**:
1. Actualiza npm:
   ```bash
   npm install -g npm@latest
   ```

2. O usa yarn en su lugar:
   ```bash
   yarn add jspdf jspdf-autotable xlsx
   ```

---

### Las Dependencias se Instalaron pero Sigue sin Funcionar

**Solución**:
1. Cierra completamente el navegador
2. Detén el servidor (Ctrl+C)
3. Limpia cache:
   ```bash
   npm run build
   ```
4. Reinicia el servidor:
   ```bash
   npm run dev
   ```

---

## 📚 ¿Qué Puedes Hacer Después?

Una vez instaladas las dependencias, podrás:

### 📊 **Tab de Calificaciones (Gradebook)**
- Ver todas las calificaciones en formato tabla
- Editar calificaciones haciendo click en las celdas
- Ver promedios calculados automáticamente
- Identificar alumnos con calificaciones bajas (< 6.0 en rojo)

### 📄 **Tab de Reportes**
- **Generar PDF de Asistencia**:
  - Con logo PulseTec
  - Tabla completa de asistencias por alumno
  - Porcentajes y estadísticas
  
- **Generar Excel de Calificaciones**:
  - Todas las calificaciones en formato de hoja de cálculo
  - Listo para compartir o imprimir
  - Compatible con Excel, Google Sheets, etc.

---

## 🎯 Resumen Rápido

```bash
# 1. Detener servidor
Ctrl + C

# 2. Instalar dependencias
npm install jspdf jspdf-autotable xlsx

# 3. Reiniciar servidor
npm run dev

# 4. Probar en el navegador
http://localhost:3000/teacher/dashboard
```

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir estos pasos aún tienes problemas:

1. Verifica que Node.js y npm estén actualizados:
   ```bash
   node --version  # Debe ser >= 18.0.0
   npm --version   # Debe ser >= 9.0.0
   ```

2. Verifica que las dependencias se instalaron:
   ```bash
   npm list jspdf jspdf-autotable xlsx
   ```

3. Revisa la consola del navegador (F12) para ver errores específicos.

---

**¡Una vez instaladas las dependencias, todo funcionará perfectamente! 🚀**


