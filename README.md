# Para Elizabeth ✨ — Galaxia de Flores Amarillas 3D

Una experiencia web 3D interactiva, romántica y elegante construida con **Three.js**, **GSAP** y **Web Audio API**.

---

## 🌟 Características

- **Galaxia de Flores Amarillas 3D**: Cientos de flores cosmos amarillas detalladas con tallos verdes, hojas y centros dorados en una formación espiral celestial.
- **Narrativa visual suave**:
  1. Pantalla de bienvenida con botón interactivo *Descubrir →*.
  2. Mensaje delicado: *"Dicen que las flores amarillas representan alegría y buenos momentos..."*
  3. Mensaje final: *"Este pequeño universo es para ti."*
  4. Gran transición espacial alejando la cámara para revelar la galaxia completa con rotación orbital e interactividad total.
- **Música de fondo**: Instrumental oficial de *"Flores Amarillas"*, activada con el clic inicial y con control de volumen/silencio.
- **100% Responsivo en Móviles**: Optimizado con FOV dinámico para pantallas de smartphones (iPhone, Android) tanto en modo vertical como horizontal, con soporte para gestos táctiles (rotar con un dedo, zoom con dos dedos).
- **Cero dependencias de compilación**: Funciona directamente en cualquier navegador moderno abriendo `index.html` o a través de **GitHub Pages**.

---

## 🚀 Cómo publicar en GitHub y activarlo en la Web (GitHub Pages)

Para que Elizabeth pueda abrir la página desde su teléfono o computadora con un enlace público (por ejemplo: `https://tu-usuario.github.io/flowers/`), sigue estos sencillos pasos:

### Opción 1: Usando la web de GitHub (Sin comandos)
1. Entra a [github.com](https://github.com/) e inicia sesión.
2. Haz clic en **"New"** para crear un nuevo repositorio.
3. Nómbralo (por ejemplo: `flores` o `flowers`). Puedes dejarlo en **Public**.
4. Haz clic en **"Upload an existing file"** (subir archivos existentes).
5. Arrastra y suelta todos los archivos de esta carpeta:
   - `index.html`
   - carpeta `css/`
   - carpeta `js/`
   - carpeta `media/`
   - `.gitignore`
   - `README.md`
6. Haz clic en **Commit changes**.
7. Ve a la pestaña **Settings** (Configuración) de tu repositorio.
8. En el menú lateral izquierdo, selecciona **Pages**.
9. En la sección **Build and deployment** > **Branch**:
   - Selecciona `main` (o `master`) y la carpeta `/ (root)`.
   - Haz clic en **Save**.
10. ¡Listo! En unos minutos GitHub te dará el enlace público:  
    `https://<tu-usuario>.github.io/<tu-repositorio>/`

---

### Opción 2: Usando Git en la terminal
```bash
# 1. Inicializar git en la carpeta
git init

# 2. Agregar todos los archivos
git add .

# 3. Guardar los cambios
git commit -m "Experiencia galaxia de flores amarillas para Elizabeth"

# 4. Cambiar rama a main
git branch -M main

# 5. Conectar con tu repositorio remoto de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# 6. Subir los archivos
git push -u origin main
```
Luego ve a **Settings** > **Pages** en GitHub y activa el despliegue desde la rama `main`.

---

## 📱 Visualización en Celulares

El proyecto cuenta con:
- Viewport optimizado para evitar zoom accidental de pantalla completa.
- Detección de orientación y ajuste dinámico del campo de visión (FOV) de la cámara.
- Gestos multitáctiles fluidos para rotar y hacer zoom en la galaxia tras la transición final.
- Botón de audio ubicado en una zona segura contra gestos del sistema en iOS/Android.

---

## 💻 Prueba Local

Para probarlo localmente en tu computadora:
1. Simplemente haz doble clic en `index.html` para abrirlo en tu navegador favorito (Chrome, Edge, Firefox, Safari).
2. O ejecuta un servidor local rápido si prefieres:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # O con Node.js
   npx serve .
   ```
