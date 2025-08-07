const WebSocket = require('ws');

console.log('🧪 Test WebSocket Connection');
console.log('');

const ws = new WebSocket('ws://localhost:3001?token=admin_test_token_123');

ws.on('open', () => {
  console.log('✅ Connessione WebSocket stabilita');
  console.log('');
  
  // Invia un messaggio di test
  const testMessage = {
    type: 'test',
    title: 'Test Message',
    message: 'Questo è un messaggio di test',
    timestamp: new Date().toISOString()
  };
  
  ws.send(JSON.stringify(testMessage));
  console.log('📤 Messaggio di test inviato');
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('📨 Messaggio ricevuto:');
    console.log('   Tipo:', message.type);
    console.log('   Titolo:', message.title);
    console.log('   Messaggio:', message.message);
    console.log('   Timestamp:', message.timestamp);
    console.log('');
  } catch (error) {
    console.error('❌ Errore parsing messaggio:', error);
  }
});

ws.on('error', (error) => {
  console.error('❌ Errore WebSocket:', error.message);
});

ws.on('close', () => {
  console.log('🔌 Connessione WebSocket chiusa');
});

// Chiudi dopo 5 secondi
setTimeout(() => {
  console.log('🛑 Chiusura test...');
  ws.close();
  process.exit(0);
}, 5000); 