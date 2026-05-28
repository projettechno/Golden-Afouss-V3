# 🌿 Golden Afouss — Booking Platform

A beautiful, bilingual (English & French) group booking website for **Golden Afouss**, a Moroccan mountain café on the Atlas road near Marrakech.

## 📄 Pages

| File | Description |
|------|-------------|
| `index.html` | Homepage with hero, features and about section |
| `menu.html` | Full café & restaurant menu with selectable items |
| `argan.html` | Afousse Association argan & beauty products boutique |
| `booking.html` | Group booking form — sends via WhatsApp or Email |
| `about.html` | About us, contact info and Google Maps link |

## 📁 File Structure

```
afousse-cafe/
├── index.html
├── menu.html
├── argan.html
├── booking.html
├── about.html
├── css/
│   └── style.css       ← shared styles for all pages
├── js/
│   └── app.js          ← shared logic (cart, language, booking)
└── README.md
```

## 🚀 How to Publish on GitHub Pages

1. Create a new GitHub repository (e.g. `afousse-cafe`)
2. Upload all files keeping the folder structure above
3. Go to **Settings → Pages**
4. Under **Source**, select `main` branch → `/ (root)` → Save
5. Your site will be live at: `https://your-username.github.io/afousse-cafe/`

## ✏️ Customising

- **Contact details** — search for `212639339952` and `afoussecafe@gmail.com` in `js/app.js` to update
- **Menu prices** — edit `data-price="XX MAD"` on each `.menu-card` in `menu.html`
- **Adding items** — copy any `.menu-card` block and update `data-id`, `data-name`, `data-namefr`, `data-price`
- **Colors** — edit the CSS variables at the top of `css/style.css`
- **Logo / name** — search for `Afousse` across all HTML files

## 🌍 Languages

The site supports **English** and **French**. Toggle is available on every page. All text uses `.en` / `.fr` CSS classes that show/hide based on the selected language.

## 📱 Booking Flow

1. Tour leader visits the site
2. Selects items from **Menu** and/or **Argan Boutique**
3. Goes to **Book Now**, fills in group details
4. Sends order via **WhatsApp** (pre-filled message) or **Email** (pre-filled draft)
5. Café staff receive the order and prepare everything before the group arrives

---

Built with ❤️ for Golden Afouss, Atlas Mountains, Marrakech.
