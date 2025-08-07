const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });

console.log('🔌 WebSocket Server avviato su ws://localhost:3001');

// Store delle connessioni attive
const connections = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');
  
  console.log('🔗 Nuova connessione WebSocket');
  console.log('Token:', token);
  
  // Salva la connessione
  connections.set(ws, { token, connectedAt: new Date() });
  
  // Invia messaggio di benvenuto
  const welcomeMessage = {
    type: 'system',
    title: 'Connessione Stabilita',
    message: 'WebSocket connesso con successo',
    timestamp: new Date().toISOString()
  };
  
  ws.send(JSON.stringify(welcomeMessage));
  
  // Gestisci messaggi in arrivo
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📨 Messaggio ricevuto:', message);
      
      // Echo del messaggio
      ws.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('❌ Errore parsing messaggio:', error);
    }
  });
  
  // Gestisci disconnessione
  ws.on('close', () => {
    console.log('🔌 Client disconnesso');
    connections.delete(ws);
  });
  
  // Gestisci errori
  ws.on('error', (error) => {
    console.error('❌ Errore WebSocket:', error);
    connections.delete(ws);
  });
});

// Funzione per inviare notifiche a tutti i client
function broadcastMessage(message) {
  const fullMessage = {
    ...message,
    timestamp: new Date().toISOString()
  };
  
  connections.forEach((connection, ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(fullMessage));
    }
  });
}

// Simula notifiche periodiche
setInterval(() => {
  const notifications = [
    {
      type: 'notification',
      title: 'Nuovo Cliente',
      message: 'Mario Rossi ha completato la registrazione'
    },
    {
      type: 'update',
      title: 'Aggiornamento Sistema',
      message: 'Database sincronizzato con successo'
    },
    {
      type: 'alert',
      title: 'Attenzione',
      message: 'Livello di rischio elevato rilevato'
    },
    {
      type: 'system',
      title: 'Backup Completato',
      message: 'Backup automatico eseguito alle 02:00'
    }
  ];
  
  const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
  broadcastMessage(randomNotification);
  
  console.log('📢 Notifica inviata:', randomNotification.title);
}, 10000); // Ogni 10 secondi

// Gestisci chiusura del server
process.on('SIGINT', () => {
  console.log('\n🛑 Chiusura WebSocket Server...');
  wss.close(() => {
    console.log('✅ WebSocket Server chiuso');
    process.exit(0);
  });
});

console.log('📢 Server pronto per inviare notifiche ogni 10 secondi');
console.log('💡 Premi Ctrl+C per fermare il server'); 