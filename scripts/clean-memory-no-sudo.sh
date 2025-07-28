#!/bin/bash

echo "🧹 Pulizia Memoria Sistema (Senza Sudo)..."

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

# Pulisci cache di Cursor/VS Code
echo "📦 Pulizia cache Cursor..."
rm -rf ~/Library/Application\ Support/Cursor/Cache/*
rm -rf ~/Library/Application\ Support/Cursor/CachedData/*

# Pulisci cache di sistema (senza sudo)
echo "📦 Pulizia cache utente..."
rm -rf ~/Library/Caches/*
rm -rf ~/Library/Logs/*

# Mostra stato memoria dopo pulizia
echo "📊 Stato memoria dopo pulizia:"
top -l 1 | grep "PhysMem"

echo "✅ Pulizia completata (senza privilegi admin)!" 