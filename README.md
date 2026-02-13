# Expense Tracker App

Una aplicación web móvil para controlar tus gastos diarios.

## 🚀 Cómo iniciar

1. **Instalar dependencias** (si no lo has hecho):

    ```bash
    npm install
    ```

2. **Iniciar servidor de desarrollo**:

    ```bash
    npm run dev
    ```

    Luego abre la URL que aparece (usualmente `http://localhost:5173`) en tu navegador.

## ⚠️ Solución de problemas comunes

### Error: "La ejecución de scripts está deshabilitada" en PowerShell

Si ves un error rojo mencionado `PSSecurityException` o `UnauthorizedAccess` al intentar ejecutar `npm`, es por las políticas de seguridad de Windows.

**Solución rápida:**
Ejecuta el comando usando `cmd` directamente:

```bash
cmd /c "npm run dev"
```

**Solución permanente:**
Cambia la política de ejecución (ejecutar en PowerShell como Administrador):

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📱 Funcionalidades

- Agregar gastos con categoría y fecha.
- Ver historial agrupado por día.
- Persistencia de datos (no se borran al recargar).
- Diseño Dark Mode premium.
