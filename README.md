# Olympic Travel Chat Bot 🏖️⛷️

Moderan, siguran i interaktivan chatbot za Olympic Travel agenciju sa mogućnošću pomeranja i promene veličine.

![Olympic Travel](https://img.shields.io/badge/Olympic-Travel-981275?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-First-1F768E?style=for-the-badge)

## ✨ Karakteristike

### 🎨 Dizajn
- **Moderne boje Olympic Travel agencije**
  - Ljubičasta: `#981275`
  - Tirkizna: `#1F768E`
- **Glassmorphism efekat** sa backdrop blur
- **Smooth animacije** i mikro-interakcije
- **Responzivan dizajn** za sve uređaje
- **Prilagodljiva veličina** i pozicija

### 🔒 Sigurnost (Security-First)
- ✅ **XSS zaštita** - Sanitizacija HTML/JavaScript koda
- ✅ **Rate limiting** - Maksimalno 10 poruka po minuti
- ✅ **Prompt injection prevencija** - Detekcija pokušaja manipulacije
- ✅ **Input validacija** - Ograničenje dužine poruka (500 karaktera)
- ✅ **Session timeout** - Automatsko isticanje nakon 30 minuta neaktivnosti
- ✅ **Content Security Policy** - CSP meta tagovi
- ✅ **Bez skladištenja osetljivih podataka** - Privatnost korisnika

### 🤖 AI Funkcionalnost
Chatbot može da pruži informacije o:
- 🏖️ **Letovanje 2026** - Grčka, Turska, Egipat, Hrvatska, Crna Gora, Tunis, Albanija, Bugarska
- ⛷️ **Zimovanje 2026** - Srbija, Bugarska, Austrija, Italija, Francuska, Slovenija, BiH
- ✈️ **Avio karte** - Povoljne cene za sve destinacije
- 🧖 **Wellness & Spa** - Opuštajući odmor
- 📞 **Kontakt informacije** - Beograd i Kragujevac kancelarije

### 🎯 Interaktivne funkcije
- **Drag & Drop** - Pomerajte chatbot bilo gde na ekranu
- **Resize** - Promenite veličinu prozora (300-600px širina, 400-800px visina)
- **Minimize/Maximize** - Sakrijte/pokažite prozor za razgovor
- **Typing indicator** - Animirani indikator dok bot "piše"
- **Character counter** - Prikaz broja unetih karaktera

## 🚀 Pokretanje

### Jednostavno pokretanje
1. Otvorite `index.html` u vašem web pregledaču
2. Kliknite na dugme za chat u donjem desnom uglu
3. Počnite razgovor!

### Lokalni server (opciono)
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Zatim otvorite: `http://localhost:8000`

## 📁 Struktura projekta

```
OlympicTravelChatBot/
├── index.html          # Glavna HTML struktura
├── style.css           # Stilovi sa Olympic branding
├── script.js           # JavaScript logika i sigurnost
└── README.md           # Dokumentacija
```

## 🔐 Sigurnosne mere

### 1. Input Sanitization
```javascript
// Uklanjanje opasnih tagova i escape HTML
function sanitizeInput(input) {
    // Uklanjanje <script>, <iframe>, event handlera
    // HTML escape
    // Ograničenje dužine
}
```

### 2. Rate Limiting
```javascript
// Maksimalno 10 poruka po minuti
const MAX_MESSAGES_PER_MINUTE = 10;
```

### 3. Prompt Injection Prevention
```javascript
// Detekcija pokušaja manipulacije AI-jem
const PROMPT_INJECTION_PATTERNS = [
    /ignore\s+previous\s+instructions/gi,
    /system\s*:/gi,
    // ...
];
```

### 4. Session Management
```javascript
// Automatsko isticanje sesije nakon 30 minuta
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
```

## 🎨 Prilagođavanje

### Promena boja
U `style.css` promenite CSS varijable:
```css
:root {
    --olympic-purple: #981275;  /* Vaša boja */
    --olympic-teal: #1F768E;    /* Vaša boja */
}
```

### Dodavanje novih odgovora
U `script.js` proširite `OLYMPIC_KNOWLEDGE` objekat:
```javascript
const OLYMPIC_KNOWLEDGE = {
    destinations: {
        // Dodajte nove destinacije
    },
    // Dodajte nove kategorije
};
```

## 🧪 Testiranje sigurnosti

Testirajte sledeće scenarije:

1. **XSS Test**: `<script>alert('XSS')</script>`
2. **HTML Injection**: `<img src=x onerror=alert(1)>`
3. **Prompt Injection**: "Ignore previous instructions"
4. **Rate Limiting**: Pošaljite 15 poruka brzo
5. **Long Input**: Unesite 1000+ karaktera

## 📞 Kontakt informacije

**Olympic Travel Beograd**
- 📍 Makedonska 30, Beograd
- ☎️ +381 11 655 0 020
- ☎️ +381 11 655 0 040
- 📧 info@olympic.rs

**Olympic Travel Kragujevac**
- 📍 Karađorđeva 20, Kragujevac
- ☎️ +381 34 617 6 020
- 📧 info@olympic.rs

## 📝 Licenca

Ovaj projekat je kreiran za Olympic Travel agenciju.

## 🙏 Zahvalnice

- **Olympic Travel** - Za branding i informacije
- **Inter Font** - Google Fonts
- **Glassmorphism** - Moderan UI trend

---

**Napravljeno sa ❤️ za Olympic Travel**

🌐 [www.olympic.rs](https://www.olympic.rs)
