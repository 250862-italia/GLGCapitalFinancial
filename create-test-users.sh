#!/bin/bash

# Modifica questa variabile con il dominio della tua app (es: https://glgcapitalfinancial.vercel.app)
BASE_URL="http://localhost:3000"

# Funzione per stampare la risposta in modo leggibile se jq è disponibile
print_json() {
  if command -v jq &> /dev/null; then
    jq
  else
    export $(cat .env | xargs)
    echo $SUPABASE_URL
  fi
}

# --- CREA SUPERADMIN ---
echo "\nCreazione superadmin..."
curl -s -X POST "$BASE_URL/api/admin/users/create" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@glgcapital.com",
    "password": "PasswordSicura123!",
    "role": "superadmin",
    "name": "Super Admin",
    "phone": "+1-555-0000"
  }' | print_json

echo "\nCreazione cliente di test..."
# --- CREA CLIENTE DI TEST ---
curl -s -X POST "$BASE_URL/api/test-register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente.test@glgcapital.com",
    "password": "TestCliente123!",
    "firstName": "Cliente",
    "lastName": "Test",
    "country": "Italy"
  }' | print_json

echo "\nFatto. Controlla la risposta per eventuali errori." 