# Namma Bites – Project Documentation & Walkthrough

## 1. Project Overview
Namma Bites is a full-stack food subscription and ordering platform with three user roles:
- **User:** Browse, subscribe, order, and manage meals.
- **Vendor:** Manage menu, orders, and subscriptions.
- **Admin:** Oversee users, vendors, and platform data.

---

## 2. Project Structure
```
Namma-Bites/
  backend/         # Node.js/Express API, MongoDB models, controllers
  frontend/        # React app (Vite, Tailwind, Framer Motion, Joyride)
  uploads/         # Uploaded images (food, vendor, payment proofs)
```

---

## 3. Key Features
### User
- Register, login, and manage profile
- Browse food menu and vendors
- Search with instant suggestions
- Add to cart, checkout, and view orders
- Subscribe to meal plans
- Onboarding tooltips for new users

### Vendor
- Login and manage own menu
- View and approve user subscriptions
- Manage orders

### Admin
- Login and manage all users and vendors
- Create new vendors
- View platform stats

---

## 4. UI/UX Upgrade Journey (Step-by-Step)
### 1. Skeleton Loaders
- Added animated skeletons to all data-fetching pages for a smooth loading experience.

### 2. Animated Buttons & Cards
- Used Framer Motion and Tailwind for interactive, modern button and card animations.

### 3. Empty State Illustrations
- Friendly SVGs and messages for empty lists (orders, cart, subscriptions).

### 4. Personalized Greetings
- Time-based, animated greetings on all dashboards (user, vendor, admin).

### 5. Instant Search Suggestions
- As-you-type dropdown for foods, vendors, and categories on the Home page.

### 6. Onboarding Tooltips
- Step-by-step guided tours for new users on Home, Cart, Orders, and Profile pages using react-joyride.

### 7. Back Buttons
- Consistent, stylish back buttons on Food Details, Subscription, Cart, and Orders pages for easy navigation.

---

## 5. How to Present (Suggested Flow)
1. **Start with the Home Page**
   - Show the animated greeting and search bar with instant suggestions.
   - Trigger the onboarding tour to highlight search, categories, and menu.

2. **Browse Foods & Vendors**
   - Demonstrate category browsing and food cards with hover/tap animations.

3. **Show Cart & Orders**
   - Add items to cart, show skeleton loaders, and trigger the Cart onboarding tour.
   - Place an order, then visit Orders page and show its onboarding.

4. **Profile Management**
   - Visit the Profile page, show the greeting, quick actions, and onboarding.

5. **Vendor/Admin Dashboards**
   - Switch to vendor/admin roles and show their dashboards, personalized greetings, and management features.

6. **Navigation**
   - Use the new back buttons to demonstrate smooth navigation.

---

## 6. Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, React Joyride
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Other:** JWT Auth, REST API, file uploads, localStorage for onboarding state

---

## 7. How to Run Locally
1. **Backend**
   - `cd backend`
   - `npm install`
   - `npm start`

2. **Frontend**
   - `cd frontend`
   - `npm install`
   - `npm run dev`

3. **Visit:**  
   - User: `http://localhost:5173/`
   - Admin: `/admin/login`
   - Vendor: `/vendor/login`

---

## 8. Customization & Extensibility
- Easily add new features (PWA, push notifications, more onboarding, etc.)
- Modular codebase for rapid UI/UX improvements

---

## 9. Screenshots/Demo (Optional)
- Add screenshots or a short demo video to your presentation for extra clarity.

---

**Good luck with your presentation!** 