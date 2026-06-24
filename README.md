# Bebio — Monitoreo del Desarrollo Infantil

Aplicación móvil para el seguimiento inteligente del desarrollo de bebés en las primeras etapas de vida.

---

## Descripción

Bebio es una app móvil desarrollada con React Native + Expo que permite a los padres registrar y visualizar el crecimiento de sus bebés, gestionar el esquema de vacunación del PAI Colombia, y consultar un asistente de inteligencia artificial con contexto real del bebé.

---

## Características principales

- Registro y autenticación de usuarios con Firebase Auth
- Soporte para múltiples bebés por cuenta
- Módulo de vacunas con el esquema PAI Colombia (21 vacunas predefinidas)
- Módulo de crecimiento con curvas de referencia OMS (P3, P50, P97)
- Cálculo automático de percentil por edad y género
- Asistente IA con Gemini con contexto completo del bebé
- Tip del día personalizado generado por IA
- Dashboard con resumen del estado del bebé
- Tema de color dinámico según el género del bebé activo

---

## Stack tecnológico

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Framework | React Native + Expo | 0.76 / 54 |
| Lenguaje | TypeScript | 5.0 |
| Estilos | NativeWind (Tailwind CSS) | 4.x |
| Navegación | React Navigation | 7.x |
| Autenticación | Firebase Auth | 12.x |
| Base de datos | Cloud Firestore | 12.x |
| Inteligencia Artificial | Google Gemini API | gemini-2.0-flash-lite |
| Gráficas | Victory Native | 36.x |
| Íconos | Expo Vector Icons (Ionicons) | — |
| CI/CD | GitHub Actions | — |

---

## Arquitectura

Bebio implementa una arquitectura en capas inspirada en Clean Architecture:

### Estructura de datos en Firestore

```
users/{uid}/
├── parentName
├── email
├── activeBabyId
└── babies/{babyId}/
    ├── name
    ├── birthDate
    ├── gender
    ├── vaccines/{vaccineId}/
    │   ├── name
    │   ├── status: "applied" | "pending"
    │   ├── appliedDate
    │   └── scheduledDate
    └── growth/{recordId}/
        ├── date
        ├── weight (kg)
        ├── height (cm)
        ├── headCircumference (cm)
        └── notes
```

---

## Instalación

### Requisitos previos

- Node.js >= 18
- npm >= 9
- Expo Go instalado en el dispositivo móvil
- Cuenta de Firebase
- API Key de Google Gemini

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/DavidG0m3z/bebio-app.git
cd bebio-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Completar el archivo .env con las credenciales

# Iniciar el servidor de desarrollo
npx expo start
```

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GEMINI_API_KEY=
```

### Reglas de seguridad Firestore

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

---

## Estructura del proyecto

```
bebio-app/
├── .github/workflows/ci.yml
├── assets/
├── src/
│   ├── components/common/
│   │   └── DatePickerModal.tsx
│   ├── constants/
│   │   ├── theme.ts
│   │   ├── vaccineList.ts
│   │   └── whoData.ts
│   ├── context/
│   │   └── BabyContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useVaccines.ts
│   │   └── useGrowth.ts
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── vaccines/
│   │   ├── growth/
│   │   └── profile/
│   ├── services/
│   │   ├── api/geminiService.ts
│   │   └── firebase/
│   │       ├── config.ts
│   │       ├── authService.ts
│   │       ├── babyService.ts
│   │       ├── vaccineService.ts
│   │       └── growthService.ts
│   └── types/
│       └── nativewind-env.d.ts
├── App.tsx
├── app.json
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## CI/CD

El proyecto usa GitHub Actions con el siguiente pipeline ejecutado en cada Pull Request:

```
Checkout → Instalar dependencias → Lint → Validar tipos → Expo Doctor
```

---

## Principios de ingeniería aplicados

- **Separación de responsabilidades** — cada capa tiene una única responsabilidad
- **Single Responsibility Principle** — cada servicio, hook y componente hace una sola cosa
- **Custom Hooks** — la lógica de negocio está completamente separada de la UI
- **Service Layer** — Firebase y Gemini API se consumen solo desde los servicios
- **React Context** — estado global del bebé activo disponible en toda la app sin prop drilling
- **Clean Code** — nombres descriptivos, funciones pequeñas, sin código duplicado

---

## Roadmap

- [ ] AsyncStorage para persistencia de sesión entre reinicios
- [ ] Módulo de alimentación (lactancia + fórmula con temporizador)
- [ ] Notificaciones push para recordatorio de vacunas
- [ ] Autenticación con Google
- [ ] Publicación en App Store y Play Store

---

## Autor

**David Ardila Gomez**
Estudiante de Ingeniería de Sistemas — Universidad de Antioquia

---
