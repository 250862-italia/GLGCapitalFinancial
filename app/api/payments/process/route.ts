import { NextRequest, NextResponse } from 'next/server';

interface PaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'bank_transfer' | 'crypto';
  investmentPackageId: string;
  cardDetails?: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    holderName: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();
    const { userId, amount, currency, paymentMethod, investmentPackageId, cardDetails } = body;

    // Validate required fields
    if (!userId || !amount || !currency || !paymentMethod || !investmentPackageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Validate card details if payment method is card
    if (paymentMethod === 'card' && !cardDetails) {
      return NextResponse.json(
        { error: 'Card details required for card payments' },
        { status: 400 }
      );
    }

    // Simulate payment processing
    const processingTime = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      // Generate transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate payment response
      const paymentResponse = {
        success: true,
        transactionId,
        amount,
        currency,
        paymentMethod,
        status: 'completed',
        timestamp: new Date().toISOString(),
        message: 'Payment processed successfully'
      };

      console.log('✅ Payment processed successfully:', {
        userId,
        transactionId,
        amount,
        currency,
        paymentMethod
      });

      return NextResponse.json(paymentResponse, { status: 200 });
    } else {
      // Simulate payment failure
      const failureReasons = [
        'Insufficient funds',
        'Card declined',
        'Invalid card details',
        'Transaction timeout',
        'Bank rejection'
      ];
      
      const failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

      console.log('❌ Payment failed:', {
        userId,
        amount,
        currency,
        paymentMethod,
        reason: failureReason
      });

      return NextResponse.json(
        {
          success: false,
          error: failureReason,
          message: 'Payment processing failed'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 