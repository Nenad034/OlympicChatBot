# Olympic Travel ChatBot - Server

Backend server za Olympic Travel ChatBot sa Google Gemini AI integracijom.

## 🚀 Brzi Start

### 1. Instalacija zavisnosti

```bash
cd server
npm install
```

### 2. Konfiguracija

Kreirajte `.env` fajl u `server` folderu:

```bash
cp .env.example .env
```

Popunite `.env` fajl sa vašim podacima:

```env
GEMINI_API_KEY=vaš_google_gemini_api_ključ
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Dobijanje Google Gemini API ključa

1. Posetite: https://makersuite.google.com/app/apikey
2. Prijavite se sa Google nalogom
3. Kliknite "Create API Key"
4. Kopirajte ključ i stavite ga u `.env` fajl

### 4. Pokretanje servera

**Development mode (sa auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server će biti dostupan na: `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

Odgovor:
```json
{
  "status": "ok",
  "service": "Olympic Travel ChatBot API",
  "timestamp": "2026-01-19T19:00:00.000Z"
}
```

### Chat
```
POST /api/chat
```

Request body:
```json
{
  "message": "Zanima me letovanje u Grčkoj",
  "history": [
    {
      "role": "user",
      "content": "Zdravo"
    },
    {
      "role": "assistant",
      "content": "Zdravo! Kako vam mogu pomoći?"
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "response": "Grčka je naša najpopularnija destinacija! ...",
  "timestamp": "2026-01-19T19:00:00.000Z"
}
```

## 🔒 Sigurnost

Server koristi:
- **Helmet.js** - Security headers
- **CORS** - Cross-Origin Resource Sharing zaštita
- **Rate Limiting** - Zaštita od preteranog broja zahteva (20 zahteva/minut)
- **Input Validation** - Validacija svih ulaznih podataka
- **Environment Variables** - Sigurno čuvanje API ključeva

## 🤖 AI Konfiguracija

Server koristi **Google Gemini 1.5 Flash** model sa:
- Custom system prompt specifičan za Olympic Travel
- Conversation history tracking
- Temperature: 0.7 (balans između kreativnosti i preciznosti)
- Max tokens: 500 (optimizovano za brze odgovore)

## 📝 Struktura Projekta

```
server/
├── server.js           # Glavni server fajl
├── package.json        # Node.js zavisnosti
├── .env.example        # Template za environment variables
├── .env               # Vaše environment variables (ne commituje se)
└── README.md          # Ova dokumentacija
```

## 🛠️ Troubleshooting

### Problem: "GEMINI_API_KEY is not defined"
**Rešenje:** Proverite da li ste kreirali `.env` fajl i dodali API ključ.

### Problem: "CORS error"
**Rešenje:** Dodajte URL vašeg frontend-a u `ALLOWED_ORIGINS` u `.env` fajlu.

### Problem: "Rate limit exceeded"
**Rešenje:** Sačekajte 1 minut ili povećajte `RATE_LIMIT_MAX_REQUESTS` u `.env`.

## 📞 Podrška

Za dodatnu pomoć kontaktirajte Olympic Travel IT tim.
