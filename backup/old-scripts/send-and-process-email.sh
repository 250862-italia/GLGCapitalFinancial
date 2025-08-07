#!/bin/bash

# Carica variabili d'ambiente da .env
if [ -f .env ]; then
  export $(cat .env | xargs)
  echo "[INFO] Variabili d'ambiente caricate da .env"
else
  echo "[ERRORE] File .env non trovato nella root del progetto."
  exit 1
fi

# Lancia lo script di invio email di test
echo "\n--- Invio email di test in coda ---"
node send-test-email.js

# Lancia lo script di processazione della coda
echo "\n--- Processazione coda email_queue ---"
node process-email-queue.js

echo "\nFatto. Controlla la console per eventuali errori e la casella destinataria per la mail di test." 