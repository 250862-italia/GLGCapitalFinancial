#!/bin/bash

echo "🚀 DEPLOY ALTERNATIVO - GLG Capital Financial"
echo "=============================================="
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per log colorato
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Controllo prerequisiti
log_info "Controllo prerequisiti..."

# Controllo Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js non trovato. Installa Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js versione 18+ richiesta. Versione attuale: $(node --version)"
    exit 1
fi

log_success "Node.js $(node --version) OK"

# Controllo npm
if ! command -v npm &> /dev/null; then
    log_error "npm non trovato"
    exit 1
fi

log_success "npm $(npm --version) OK"

# Controllo Git
if ! command -v git &> /dev/null; then
    log_warning "Git non trovato - deploy locale"
else
    log_success "Git $(git --version | cut -d' ' -f3) OK"
fi

echo ""

# Step 1: Pulizia
log_info "Step 1: Pulizia build precedenti..."
if [ -d ".next" ]; then
    rm -rf .next
    log_success "Directory .next rimossa"
fi

if [ -d "out" ]; then
    rm -rf out
    log_success "Directory out rimossa"
fi

# Step 2: Installazione dipendenze
log_info "Step 2: Installazione dipendenze..."
npm install
if [ $? -eq 0 ]; then
    log_success "Dipendenze installate"
else
    log_error "Errore installazione dipendenze"
    exit 1
fi

# Step 3: Build dell'applicazione
log_info "Step 3: Build dell'applicazione..."
npm run build
if [ $? -eq 0 ]; then
    log_success "Build completata"
else
    log_error "Errore durante il build"
    exit 1
fi

# Step 4: Build statico (opzionale)
log_info "Step 4: Build statico per deploy..."
npx next export --outdir out
if [ $? -eq 0 ]; then
    log_success "Build statico completato in directory 'out'"
else
    log_warning "Build statico fallito - continuo con build dinamico"
fi

# Step 5: Test locale
log_info "Step 5: Test locale dell'applicazione..."
echo ""
log_info "Avvio server di test su http://localhost:3000"
log_info "Premi Ctrl+C per fermare il test"
echo ""

# Avvia server di test
npm start &
SERVER_PID=$!

# Aspetta che il server si avvii
sleep 5

# Controlla se il server è attivo
if curl -s http://localhost:3000 > /dev/null; then
    log_success "Server attivo su http://localhost:3000"
    log_info "Test completato - Server funzionante"
else
    log_warning "Server non raggiungibile - controlla i log"
fi

# Ferma il server di test
kill $SERVER_PID 2>/dev/null

echo ""
log_info "Step 6: Preparazione per deploy..."

# Crea file di configurazione per diversi ambienti
cat > deploy-config.json << EOF
{
  "deployment": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "version": "1.0.0",
    "environment": "production",
    "build_type": "nextjs",
    "node_version": "$(node --version)",
    "npm_version": "$(npm --version)"
  },
  "urls": {
    "local": "http://localhost:3000",
    "production": "https://your-domain.com"
  },
  "directories": {
    "build": ".next",
    "static": "out",
    "public": "public"
  },
  "deploy_options": {
    "vercel": "vercel --prod",
    "netlify": "netlify deploy --prod",
    "manual": "npm start",
    "docker": "docker build -t glg-capital . && docker run -p 3000:3000 glg-capital"
  }
}
EOF

log_success "File di configurazione deploy creato: deploy-config.json"

# Crea script per diversi provider
cat > deploy-vercel.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploy su Vercel..."
vercel --prod
EOF

cat > deploy-netlify.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploy su Netlify..."
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi
netlify deploy --prod
EOF

cat > deploy-docker.sh << 'EOF'
#!/bin/bash
echo "🐳 Deploy con Docker..."
docker build -t glg-capital-financial .
docker run -d -p 3000:3000 --name glg-capital glg-capital-financial
echo "Container avviato su http://localhost:3000"
EOF

cat > deploy-manual.sh << 'EOF'
#!/bin/bash
echo "🔧 Deploy manuale..."
echo "1. Copia i file su server"
echo "2. Installa dipendenze: npm install --production"
echo "3. Avvia: npm start"
echo "4. Configura reverse proxy (nginx/apache)"
EOF

# Rendi eseguibili gli script
chmod +x deploy-*.sh

log_success "Script di deploy creati per diversi provider"

# Crea Dockerfile per deploy containerizzato
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm ci --only=production

# Copia codice sorgente
COPY . .

# Build dell'applicazione
RUN npm run build

# Esponi porta
EXPOSE 3000

# Comando di avvio
CMD ["npm", "start"]
EOF

log_success "Dockerfile creato per deploy containerizzato"

# Crea docker-compose per facilità di deploy
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  glg-capital:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
EOF

log_success "docker-compose.yml creato"

echo ""
log_success "🎉 DEPLOY ALTERNATIVO COMPLETATO!"
echo ""
echo "📋 OPZIONI DISPONIBILI:"
echo "1. 🚀 Vercel: ./deploy-vercel.sh"
echo "2. 🌐 Netlify: ./deploy-netlify.sh"
echo "3. 🐳 Docker: ./deploy-docker.sh"
echo "4. 🔧 Manuale: ./deploy-manual.sh"
echo ""
echo "📁 FILE CREATI:"
echo "- deploy-config.json (configurazione)"
echo "- Dockerfile (container Docker)"
echo "- docker-compose.yml (orchestrazione)"
echo "- deploy-*.sh (script per provider)"
echo ""
echo "🌐 TEST LOCALE:"
echo "- Build dinamico: .next/"
echo "- Build statico: out/"
echo "- Server test: npm start"
echo ""
echo "🚀 PROSSIMO PASSO:"
echo "Scegli un provider e esegui lo script corrispondente!" 