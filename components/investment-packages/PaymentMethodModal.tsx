import React, { useState } from 'react';

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  processingTime: string;
  fees: string;
  instructions: string;
  color: string;
  bgColor: string;
}

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod) => void;
  packageName: string;
  amount: number;
  loading?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'bank_transfer',
    name: 'Bonifico Bancario',
    description: 'Trasferimento bancario tradizionale sicuro',
    icon: '🏦',
    processingTime: '1-3 giorni lavorativi',
    fees: 'Gratuito',
    instructions: 'Riceverai le coordinate bancarie complete via email entro 24 ore',
    color: 'text-green-700',
    bgColor: 'bg-green-50'
  },
  {
    id: 'credit_card',
    name: 'Carta di Credito',
    description: 'Pagamento immediato con carta di credito/debito',
    icon: '💳',
    processingTime: 'Immediato',
    fees: '2.5% + €0.30',
    instructions: 'Pagamento sicuro tramite Stripe con crittografia SSL',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'crypto',
    name: 'Criptovalute',
    description: 'Pagamento con Bitcoin, Ethereum, USDT',
    icon: '₿',
    processingTime: '10-30 minuti',
    fees: '1%',
    instructions: 'Riceverai l\'indirizzo wallet e le istruzioni via email',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50'
  }
];

export default function PaymentMethodModal({
  isOpen,
  onClose,
  onConfirm,
  packageName,
  amount,
  loading = false
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedMethod) {
      onConfirm(selectedMethod);
    }
  };

  const calculateFees = (method: PaymentMethod) => {
    if (method.id === 'credit_card') {
      return amount * 0.025 + 0.30;
    } else if (method.id === 'crypto') {
      return amount * 0.01;
    }
    return 0;
  };

  const totalAmount = selectedMethod ? amount + calculateFees(selectedMethod) : amount;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Scegli Metodo di Pagamento</h2>
              <p className="text-blue-100 mt-1">
                {packageName} • €{amount.toLocaleString('it-IT')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl font-light transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Seleziona il tuo metodo preferito:</h3>
          
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.id}
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedMethod?.id === method.id
                  ? `border-blue-500 ${method.bgColor} shadow-lg scale-[1.02]`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedMethod(method)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`text-4xl p-3 rounded-full ${method.bgColor}`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-bold text-lg ${method.color}`}>{method.name}</h3>
                      {selectedMethod?.id === method.id && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Selezionato
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{method.description}</p>
                    <div className="flex items-center space-x-6 mt-3 text-sm">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <span className="text-blue-500">⏱️</span>
                        <span>{method.processingTime}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <span className="text-green-500">💰</span>
                        <span>{method.fees}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod?.id === method.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedMethod?.id === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Selected Method Details */}
          {selectedMethod && (
            <div className={`mt-6 p-6 rounded-xl ${selectedMethod.bgColor} border border-gray-200`}>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">{selectedMethod.icon}</span>
                <h4 className={`font-bold text-lg ${selectedMethod.color}`}>
                  Dettagli {selectedMethod.name}
                </h4>
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-3">{selectedMethod.instructions}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3">Riepilogo Costi</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Importo investimento:</span>
                    <span className="font-medium">€{amount.toLocaleString('it-IT')}</span>
                  </div>
                  {calculateFees(selectedMethod) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Commissioni ({selectedMethod.fees}):</span>
                      <span className="font-medium text-red-600">€{calculateFees(selectedMethod).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Totale da pagare:</span>
                      <span className="text-green-600">€{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 border-t">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Torna indietro
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedMethod || loading}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                selectedMethod && !loading
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Elaborazione...</span>
                </div>
              ) : (
                'Procedi al Pagamento'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 