# GLG Capital Financial - API Documentation

## 📋 Panoramica

L'API di GLG Capital Financial è un sistema RESTful completo per la gestione di investimenti, clienti e amministrazione. Tutte le API utilizzano autenticazione JWT e protezione CSRF.

## 🔐 Autenticazione

### Headers Richiesti
```http
Authorization: Bearer <jwt_token>
X-CSRF-Token: <csrf_token>
Content-Type: application/json
```

### Ottenere CSRF Token
```http
GET /api/csrf
```

**Response:**
```json
{
  "csrfToken": "abc123-def456-ghi789"
}
```

## 📊 Endpoints Principali

### Autenticazione

#### POST /api/auth/login
Autentica un utente con email e password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "kyc_status": "approved"
    },
    "client": {
      "client_code": "CLI001",
      "status": "active",
      "total_invested": 50000
    }
  },
  "session": {
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here",
    "expires_at": 1640995200000
  },
  "csrfToken": "new_csrf_token",
  "message": "Accesso effettuato con successo"
}
```

**Response Error (401):**
```json
{
  "success": false,
  "error": {
    "type": "AUTHENTICATION_ERROR",
    "message": "Credenziali non valide. Verifica email e password.",
    "code": "AUTH_ERROR"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "requestId": "req_1640995200000_abc123"
}
```

#### POST /api/auth/register
Registra un nuovo utente.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "first_name": "New",
  "last_name": "User",
  "phone": "+1234567890",
  "country": "Italy"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Registrazione completata. Controlla la tua email per confermare l'account.",
  "user": {
    "id": "new-user-uuid",
    "email": "newuser@example.com",
    "name": "New User"
  }
}
```

#### POST /api/auth/logout
Disconnette l'utente corrente.

**Response Success (200):**
```json
{
  "success": true,
  "message": "Logout completato con successo"
}
```

### Gestione Clienti

#### GET /api/profile/[user_id]
Ottiene il profilo di un utente.

**Response Success (200):**
```json
{
  "success": true,
  "profile": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-01",
    "address": "Via Roma 123",
    "city": "Milano",
    "country": "Italy",
    "postal_code": "20100",
    "kyc_status": "approved",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

#### PUT /api/profile/update
Aggiorna il profilo dell'utente.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": "Via Roma 123",
  "city": "Milano",
  "country": "Italy",
  "postal_code": "20100"
}
```

### Investimenti

#### GET /api/investments
Ottiene la lista degli investimenti dell'utente.

**Query Parameters:**
- `status`: Filtra per status (active, completed, pending)
- `page`: Numero di pagina (default: 1)
- `limit`: Elementi per pagina (default: 10)

**Response Success (200):**
```json
{
  "success": true,
  "investments": [
    {
      "id": "inv-uuid",
      "package_name": "Premium Investment Package",
      "amount": 10000,
      "daily_return": 1.5,
      "duration": 30,
      "start_date": "2024-01-01T12:00:00.000Z",
      "end_date": "2024-01-31T12:00:00.000Z",
      "status": "active",
      "total_earned": 450,
      "daily_earnings": 15,
      "monthly_earnings": 450
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

#### POST /api/investments
Crea un nuovo investimento.

**Request Body:**
```json
{
  "package_id": "pkg-uuid",
  "amount": 10000,
  "payment_method": "bank_transfer"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "investment": {
    "id": "new-inv-uuid",
    "package_id": "pkg-uuid",
    "amount": 10000,
    "status": "pending",
    "expected_return": 1.5,
    "investment_date": "2024-01-01T12:00:00.000Z"
  },
  "message": "Investimento creato con successo"
}
```

#### GET /api/investments/[id]
Ottiene i dettagli di un investimento specifico.

**Response Success (200):**
```json
{
  "success": true,
  "investment": {
    "id": "inv-uuid",
    "package_name": "Premium Investment Package",
    "amount": 10000,
    "daily_return": 1.5,
    "duration": 30,
    "start_date": "2024-01-01T12:00:00.000Z",
    "end_date": "2024-01-31T12:00:00.000Z",
    "status": "active",
    "total_earned": 450,
    "daily_earnings": 15,
    "monthly_earnings": 450,
    "payment_method": "bank_transfer",
    "transaction_id": "TXN123456"
  }
}
```

### Pacchetti di Investimento

#### GET /api/packages
Ottiene la lista dei pacchetti di investimento disponibili.

**Query Parameters:**
- `status`: Filtra per status (active, inactive)
- `type`: Filtra per tipo (premium, balanced, conservative)
- `risk_level`: Filtra per livello di rischio (low, medium, high)

**Response Success (200):**
```json
{
  "success": true,
  "packages": [
    {
      "id": "pkg-uuid",
      "name": "Premium Investment Package",
      "description": "High-yield investment package with premium returns",
      "type": "premium",
      "min_investment": 10000,
      "max_investment": 100000,
      "expected_return": 2.5,
      "duration_months": 12,
      "risk_level": "high",
      "management_fee": 1.0,
      "performance_fee": 0.5,
      "currency": "USD",
      "status": "active",
      "is_featured": true
    }
  ]
}
```

### Richieste Informative

#### POST /api/informational-request
Crea una nuova richiesta informativa.

**Request Body:**
```json
{
  "request_type": "document_request",
  "subject": "Richiesta documentazione fiscale",
  "message": "Ho bisogno della documentazione fiscale per l'anno 2023",
  "priority": "medium"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "request": {
    "id": "req-uuid",
    "request_type": "document_request",
    "subject": "Richiesta documentazione fiscale",
    "message": "Ho bisogno della documentazione fiscale per l'anno 2023",
    "status": "pending",
    "priority": "medium",
    "submitted_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "Richiesta inviata con successo"
}
```

#### GET /api/informational-request
Ottiene le richieste informative dell'utente.

**Response Success (200):**
```json
{
  "success": true,
  "requests": [
    {
      "id": "req-uuid",
      "request_type": "document_request",
      "subject": "Richiesta documentazione fiscale",
      "message": "Ho bisogno della documentazione fiscale per l'anno 2023",
      "status": "processing",
      "priority": "medium",
      "submitted_at": "2024-01-01T12:00:00.000Z",
      "response": "La documentazione sarà disponibile entro 5 giorni lavorativi"
    }
  ]
}
```

## 🔧 Endpoints Admin

### Gestione Clienti (Admin)

#### GET /api/admin/clients
Ottiene la lista di tutti i clienti (solo admin).

**Query Parameters:**
- `status`: Filtra per status
- `search`: Ricerca per nome o email
- `page`: Numero di pagina
- `limit`: Elementi per pagina

**Response Success (200):**
```json
{
  "success": true,
  "clients": [
    {
      "id": "client-uuid",
      "user_id": "user-uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "status": "active",
      "risk_profile": "moderate",
      "total_invested": 50000,
      "created_at": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "total_pages": 15
  }
}
```

#### PUT /api/admin/clients/[id]
Aggiorna i dati di un cliente (solo admin).

**Request Body:**
```json
{
  "status": "suspended",
  "risk_profile": "high",
  "notes": "Cliente sospeso per documentazione mancante"
}
```

### Gestione Investimenti (Admin)

#### GET /api/admin/investments
Ottiene tutti gli investimenti (solo admin).

**Response Success (200):**
```json
{
  "success": true,
  "investments": [
    {
      "id": "inv-uuid",
      "user_id": "user-uuid",
      "client_name": "John Doe",
      "package_name": "Premium Investment Package",
      "amount": 10000,
      "status": "active",
      "expected_return": 2.5,
      "total_returns": 450,
      "investment_date": "2024-01-01T12:00:00.000Z"
    }
  ],
  "stats": {
    "total_investments": 150,
    "total_amount": 1500000,
    "active_investments": 120,
    "average_return": 2.1
  }
}
```

#### PUT /api/admin/investments/[id]
Aggiorna lo status di un investimento (solo admin).

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Investimento approvato dopo verifica documenti"
}
```

### Gestione Pacchetti (Admin)

#### POST /api/admin/packages
Crea un nuovo pacchetto di investimento (solo admin).

**Request Body:**
```json
{
  "name": "New Investment Package",
  "description": "New package description",
  "type": "premium",
  "min_investment": 5000,
  "max_investment": 50000,
  "expected_return": 2.0,
  "duration_months": 6,
  "risk_level": "medium",
  "management_fee": 0.5,
  "performance_fee": 0.2,
  "currency": "USD",
  "is_featured": false
}
```

#### PUT /api/admin/packages/[id]
Aggiorna un pacchetto di investimento (solo admin).

#### DELETE /api/admin/packages/[id]
Elimina un pacchetto di investimento (solo admin).

## 📊 Analytics e Monitoring

#### GET /api/analytics/dashboard
Ottiene le statistiche del dashboard (solo admin).

**Response Success (200):**
```json
{
  "success": true,
  "stats": {
    "total_users": 1250,
    "total_investments": 850,
    "total_amount_invested": 12500000,
    "active_investments": 720,
    "pending_requests": 45,
    "monthly_growth": 12.5
  },
  "charts": {
    "investments_by_month": [
      { "month": "Jan", "amount": 1200000 },
      { "month": "Feb", "amount": 1350000 }
    ],
    "users_by_status": [
      { "status": "active", "count": 1100 },
      { "status": "pending", "count": 150 }
    ]
  }
}
```

## 🚨 Gestione Errori

### Formato Errori Standard

Tutti gli errori seguono questo formato:

```json
{
  "success": false,
  "error": {
    "type": "ERROR_TYPE",
    "message": "Descrizione dell'errore",
    "code": "ERROR_CODE",
    "details": {
      "field": "Campo specifico con errore",
      "value": "Valore problematico"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "requestId": "req_1640995200000_abc123"
}
```

### Codici di Errore Comuni

| Codice | Tipo | Descrizione |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Dati di input non validi |
| 401 | AUTHENTICATION_ERROR | Autenticazione fallita |
| 403 | AUTHORIZATION_ERROR | Accesso negato |
| 404 | NOT_FOUND_ERROR | Risorsa non trovata |
| 429 | RATE_LIMIT_ERROR | Troppe richieste |
| 500 | INTERNAL_ERROR | Errore interno del server |

### Esempi di Errori

#### Errore di Validazione (400)
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Dati di input non validi",
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Formato email non valido",
      "password": "Password deve essere di almeno 6 caratteri"
    }
  }
}
```

#### Errore di Autenticazione (401)
```json
{
  "success": false,
  "error": {
    "type": "AUTHENTICATION_ERROR",
    "message": "Token di autenticazione scaduto",
    "code": "AUTH_ERROR"
  }
}
```

#### Errore di Autorizzazione (403)
```json
{
  "success": false,
  "error": {
    "type": "AUTHORIZATION_ERROR",
    "message": "Accesso negato. Richiesti permessi di amministratore",
    "code": "AUTHZ_ERROR"
  }
}
```

## 📝 Best Practices

### Rate Limiting
- Limite: 100 richieste per minuto per IP
- Header di risposta: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Paginazione
- Parametri: `page` (default: 1), `limit` (default: 10, max: 100)
- Response include sempre oggetto `pagination`

### Filtri e Ricerca
- Parametri di query per filtrare risultati
- Ricerca testuale su campi specifici
- Ordinamento con `sort_by` e `sort_order`

### Caching
- Headers di cache appropriati
- ETag per validazione condizionale
- Cache-Control per controllare caching

### Sicurezza
- Tutte le richieste richiedono CSRF token
- Autenticazione JWT obbligatoria
- Validazione input rigorosa
- Sanitizzazione output

## 🔄 Webhooks

### Eventi Disponibili
- `user.registered`: Nuovo utente registrato
- `investment.created`: Nuovo investimento creato
- `investment.status_changed`: Status investimento cambiato
- `payment.completed`: Pagamento completato

### Formato Webhook
```json
{
  "event": "investment.created",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": {
    "investment_id": "inv-uuid",
    "user_id": "user-uuid",
    "amount": 10000,
    "status": "pending"
  },
  "signature": "hmac_signature"
}
```

## 📞 Supporto

Per supporto tecnico:
- Email: api-support@glgcapital.com
- Documentazione: https://docs.glgcapital.com/api
- Status: https://status.glgcapital.com

## 📄 Versioning

L'API utilizza versioning semantico. La versione corrente è `v1`.

Per specificare una versione, includi l'header:
```http
Accept: application/vnd.glgcapital.v1+json
``` 