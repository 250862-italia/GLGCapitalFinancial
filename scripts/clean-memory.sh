#!/bin/bash

echo "🧹 Pulizia Memoria Sistema..."

# Pulisci cache di sistema
echo "📦 Pulizia cache di sistema..."
sudo purge

# Pulisci cache npm se presente
if command -v npm &> /dev/null; then
    echo "📦 Pulizia cache npm..."
    npm cache clean --force
fi

# Pulisci cache yarn se presente
if command -v yarn &> /dev/null; then
    echo "📦 Pulizia cache yarn..."
    yarn cache clean
fi

# Riavvia servizi di sistema
echo "🔄 Riavvio servizi di sistema..."
sudo killall -HUP mDNSResponder

# Mostra stato memoria dopo pulizia
echo "📊 Stato memoria dopo pulizia:"
top -l 1 | grep "PhysMem"

echo "✅ Pulizia completata!" 