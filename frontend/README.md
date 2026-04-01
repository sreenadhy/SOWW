# Sritha Oils Frontend

Responsive React frontend for the existing Sritha Oils backend.

## Folder Structure

```text
frontend/
|-- .env.example
|-- index.html
|-- package.json
|-- vite.config.js
`-- src/
    |-- App.jsx
    |-- main.jsx
    |-- components/
    |   |-- AuthPanel.jsx
    |   |-- CheckoutPanel.jsx
    |   |-- Footer.jsx
    |   |-- Header.jsx
    |   |-- HeroSection.jsx
    |   `-- ProductCatalog.jsx
    |-- services/
    |   `-- api.js
    `-- styles/
        |-- app.css
        |-- auth-panel.css
        |-- checkout-panel.css
        |-- footer.css
        |-- header.css
        |-- hero-section.css
        |-- index.css
        `-- product-catalog.css
```

## Environment

Create a `.env` file in `frontend/` and set:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Run

```bash
npm install
npm run dev
```

The app will run on `http://localhost:5173`.
