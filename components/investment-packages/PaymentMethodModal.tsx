import React, { useState } from 'react';

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  processingTime: string;
  fees: string;
  instructions: string;
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
    description: 'Trasferimento bancario tradizionale',
    icon: '🏦',
    processingTime: '1-3 giorni lavorativi',
    fees: 'Gratuito',
    instructions: 'Riceverai le coordinate bancarie via email'
  },
  {
    id: 'credit_card',
    name: 'Carta di Credito',
    description: 'Pagamento con carta di credito/debito',
    icon: '💳',
    processingTime: 'Immediato',
    fees: '2.5% + €0.30',
    instructions: 'Pagamento sicuro tramite Stripe'
  },
  {
    id: 'crypto',
    name: 'Criptovalute',
    description: 'Pagamento con Bitcoin, Ethereum, USDT',
    icon: '₿',
    processingTime: '10-30 minuti',
    fees: '1%',
    instructions: 'Riceverai l\'indirizzo wallet via email'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Scegli Metodo di Pagamento</h2>
            <p className="text-gray-600 mt-1">
              {packageName} - €{amount.toLocaleString('it-IT')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <div className="space-y-4">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedMethod?.id === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod(method)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{method.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{method.name}</h3>
                      <p className="text-gray-600 text-sm">{method.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>⏱️ {method.processingTime}</span>
                        <span>💰 {method.fees}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedMethod?.id === method.id}
                      onChange={() => setSelectedMethod(method)}
                      className="w-5 h-5 text-blue-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Method Details */}
          {selectedMethod && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Dettagli {selectedMethod.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{selectedMethod.instructions}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Importo investimento:</span>
                  <span>€{amount.toLocaleString('it-IT')}</span>
                </div>
                {calculateFees(selectedMethod) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Commissioni:</span>
                    <span>€{calculateFees(selectedMethod).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Totale:</span>
                  <span>€{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedMethod || loading}
            className={`px-8 py-3 rounded-lg font-semibold ${
              selectedMethod && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Elaborazione...' : 'Procedi al Pagamento'}
          </button>
        </div>
      </div>
    </div>
  );
} 