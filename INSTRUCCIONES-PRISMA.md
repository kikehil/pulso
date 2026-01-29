# 🔧 Solución al Error: "Unknown argument subjectId"

## ❌ Problema

El cliente de Prisma no se regeneró correctamente después de actualizar el schema. El servidor de desarrollo bloquea los archivos y no permite la regeneración.

## ✅ Solución Rápida

### Opción 1: Script Automático (Recomendado)

1. **Detén el servidor:**
   - En la terminal donde está `npm run dev`
   - Presiona `Ctrl + C`

2. **Ejecuta el script:**
   ```powershell
   .\fix-prisma.ps1
   ```

3. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

4. **Recarga el navegador:**
   - Presiona `Ctrl + Shift + R` (recarga forzada)

---

### Opción 2: Pasos Manuales

1. **Detén el servidor:**
   ```bash
   # Presiona Ctrl+C en la terminal donde corre npm run dev
   ```

2. **Sincroniza la base de datos:**
   ```bash
   npx prisma db push
   ```

3. **Regenera el cliente:**
   ```bash
   npx prisma generate
   ```

4. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

5. **Recarga el navegador:**
   - Presiona `Ctrl + Shift + R` (recarga forzada)

---

## 🎯 Verificación

Después de seguir los pasos, intenta crear un grupo nuevamente:

1. Ve a `/teacher/groups`
2. Click en "Nuevo Grupo"
3. Llena los datos
4. Click en "Crear Grupo"

✅ **Debería funcionar sin errores**

---

## 🔍 ¿Por qué pasó esto?

Cuando se actualiza el `schema.prisma`, es necesario regenerar el cliente de Prisma para que TypeScript reconozca los nuevos campos. En este caso:

- Se agregó el campo `subjectId` al modelo `Group`
- El cliente no se regeneró completamente debido a un error de permisos
- El servidor estaba usando la versión antigua del cliente

---

## 📝 Nota Importante

**Siempre que modifiques `prisma/schema.prisma`:**

1. Detén el servidor
2. Ejecuta `npx prisma db push` (sincroniza BD)
3. Ejecuta `npx prisma generate` (regenera cliente)
4. Inicia el servidor

O simplemente ejecuta: `.\fix-prisma.ps1`

---

## 🆘 Si aún tienes problemas

1. **Elimina la carpeta generada:**
   ```bash
   rmdir /s /q node_modules\.prisma
   ```

2. **Regenera:**
   ```bash
   npx prisma generate
   ```

3. **Reinicia completamente:**
   ```bash
   npm run dev
   ```

