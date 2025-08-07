#!/bin/bash

# Script di monitoraggio memoria continuo
# Esegui con: ./monitor-memory.sh

echo "📊 MONITORAGGIO MEMORIA CONTINUO - GLG Capital Financial"
echo "=================================================="

# Configurazione
CRITICAL_THRESHOLD=90
HIGH_THRESHOLD=80
CHECK_INTERVAL=10

# Funzione per ottenere utilizzo memoria
get_memory_usage() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        MEMORY_INFO=$(top -l 1 | grep "PhysMem")
        USED=$(echo $MEMORY_INFO | awk '{print $2}' | sed 's/[^0-9]//g')
        TOTAL=$(echo $MEMORY_INFO | awk '{print $4}' | sed 's/[^0-9]//g')
        USAGE_PERCENT=$((USED * 100 / TOTAL))
    else
        # Linux
        MEMORY_INFO=$(free | grep Mem)
        USED=$(echo $MEMORY_INFO | awk '{print $3}')
        TOTAL=$(echo $MEMORY_INFO | awk '{print $2}')
        USAGE_PERCENT=$((USED * 100 / TOTAL))
    fi
    echo $USAGE_PERCENT
}

# Funzione per log con timestamp
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Funzione per cleanup emergenza
emergency_cleanup() {
    log_message "🚨 EMERGENZA: Memoria critica - Avvio cleanup..."
    
    # Kill processi Node.js non essenziali
    pkill -f "node.*dev" 2>/dev/null || true
    
    # Cleanup cache
    rm -rf .next 2>/dev/null || true
    rm -rf node_modules/.cache 2>/dev/null || true
    
    # Purge memoria sistema (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sudo purge 2>/dev/null || true
    fi
    
    log_message "✅ Cleanup emergenza completato"
}

# Funzione per restart server
restart_server() {
    log_message "🔄 Restart server..."
    
    # Kill tutti i processi Node.js
    pkill -f node 2>/dev/null || true
    pkill -f npm 2>/dev/null || true
    
    # Attendi 5 secondi
    sleep 5
    
    # Restart con ottimizzazioni
    NODE_OPTIONS="--max-old-space-size=4096 --expose-gc" npm run dev > server.log 2>&1 &
    
    log_message "✅ Server riavviato con ottimizzazioni memoria"
}

# Contatore per restart automatici
RESTART_COUNT=0
MAX_RESTARTS=3

# Loop principale di monitoraggio
while true; do
    MEMORY_USAGE=$(get_memory_usage)
    
    # Log stato memoria
    if [ $MEMORY_USAGE -gt $CRITICAL_THRESHOLD ]; then
        log_message "🚨 CRITICO: ${MEMORY_USAGE}% memoria utilizzata"
        
        # Cleanup emergenza
        emergency_cleanup
        
        # Se ancora critico dopo cleanup, restart
        sleep 5
        MEMORY_AFTER_CLEANUP=$(get_memory_usage)
        
        if [ $MEMORY_AFTER_CLEANUP -gt $CRITICAL_THRESHOLD ] && [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
            log_message "⚠️ Memoria ancora critica dopo cleanup - Restart automatico"
            restart_server
            RESTART_COUNT=$((RESTART_COUNT + 1))
        elif [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
            log_message "❌ Massimo numero restart raggiunto - Intervento manuale richiesto"
            break
        fi
        
    elif [ $MEMORY_USAGE -gt $HIGH_THRESHOLD ]; then
        log_message "⚠️ ALTO: ${MEMORY_USAGE}% memoria utilizzata"
        
        # Cleanup normale
        log_message "🧹 Cleanup memoria normale..."
        rm -rf .next 2>/dev/null || true
        rm -rf node_modules/.cache 2>/dev/null || true
        
    else
        log_message "✅ NORMALE: ${MEMORY_USAGE}% memoria utilizzata"
        
        # Reset contatore restart se memoria normale
        if [ $MEMORY_USAGE -lt 70 ]; then
            RESTART_COUNT=0
        fi
    fi
    
    # Mostra processi Node.js attivi
    NODE_PROCESSES=$(ps aux | grep -E "(node|npm)" | grep -v grep | wc -l)
    log_message "📊 Processi Node.js attivi: $NODE_PROCESSES"
    
    # Attendi prima del prossimo controllo
    sleep $CHECK_INTERVAL
done

echo "🛑 Monitoraggio memoria terminato" 