# 🚀 Mentoria Angular 21 - Full Stack

**Frontend:** Angular 21 Standalone Components  
**Backend:** NestJS (próximamente)  
**Styles:** Dark mode elegante profesional

---

## 🎯 Qué tienes

✅ Landing completo en Angular 21  
✅ Componentes standalone (sin módulos)  
✅ Booking system funcional  
✅ Admin dashboard  
✅ Estilos profesionales  
✅ Responsive mobile  

---

## ⚡ Setup (2 minutos)

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en desarrollo
npm start

# 3. Abre http://localhost:4200
```

---

## 📁 Estructura

```
src/
├── app/
│   ├── app.component.ts         (Root)
│   ├── app.config.ts            (Config)
│   ├── app.routes.ts            (Routing)
│   ├── components/
│   │   ├── header/
│   │   ├── footer/
│   │   └── all-components.ts    (Hero, Booking, Features, etc)
│   └── pages/
│       ├── landing.component.ts
│       └── admin.component.ts
├── styles.css                    (Global styles)
├── index.html
└── main.ts
```

---

## 🔧 Build para producción

```bash
npm run build
# Genera dist/mentoria-angular/ listo para servir
```

---

## 📝 Personalizaciones

**Colores:**
```css
--primary: #FF0033
--dark-bg: #0d0d0d
--card-bg: #1a1a1a
--border: #2a2a2a
--text: #e8e8e8
--text-light: #a8a8a8
```

**Precios:**
Busca en `all-components.ts` y reemplaza los valores.

**Textos:**
Todo el contenido está en los templates de los componentes.

---

## 🚀 Deploy

### Vercel
```bash
vercel
# Auto-detecta Angular, builds y deploya
```

### Tu servidor
```bash
npm run build
# Copia dist/mentoria-angular/ a tu servidor
# Sirve con nginx/apache
```

---

## 📱 Features

- ✅ Hero section con stats
- ✅ Booking form funcional
- ✅ Features grid
- ✅ Pricing plans
- ✅ Testimonials
- ✅ FAQ accordion
- ✅ Admin dashboard (skeleton)
- ✅ Mobile responsive
- ✅ Dark mode
- ✅ Smooth scrolling

---

## 🔜 Próximo paso

Backend NestJS para:
- Auth JWT
- Guardar bookings en MongoDB
- Email automático
- Admin panel

---

**Hecho en Angular 21. Listo para producción.** 🎯
