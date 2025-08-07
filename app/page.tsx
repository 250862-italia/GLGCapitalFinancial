import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            GLG Capital Financial
          </h1>
          <p className="text-gray-600 mb-8">
            Sistema di gestione investimenti
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/admin"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors block text-center"
            >
              🛠️ Admin Panel
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Per accedere come admin:</p>
              <ol className="list-decimal list-inside mt-2 text-left">
                <li>Vai su /admin</li>
                <li>Apri la console (F12)</li>
                <li>Esegui: localStorage.setItem("admin_token", "admin_test_token_123")</li>
                <li>Ricarica la pagina</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 