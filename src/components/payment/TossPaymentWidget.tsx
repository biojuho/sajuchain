'use client';

import React, { useEffect, useRef } from 'react';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { nanoid } from 'nanoid';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrKwdP7VgVgLzN97Eoq';
const customerKey = nanoid(); // Random customer key for non-logged in users

interface TossPaymentWidgetProps {
    price: number;
    orderName: string;
}

export default function TossPaymentWidget({ price, orderName }: TossPaymentWidgetProps) {
    const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
    const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderPaymentMethods']> | null>(null);

    useEffect(() => {
        (async () => {
            const paymentWidget = await loadPaymentWidget(clientKey, customerKey);

            const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
                '#payment-widget',
                { value: price },
                { variantKey: 'DEFAULT' }
            );

            paymentWidget.renderAgreement(
                '#agreement',
                { variantKey: 'AGREEMENT' }
            );

            paymentWidgetRef.current = paymentWidget;
            paymentMethodsWidgetRef.current = paymentMethodsWidget;
        })();
    }, [price]);

    useEffect(() => {
        const paymentMethodsWidget = paymentMethodsWidgetRef.current;
        if (paymentMethodsWidget == null) {
            return;
        }
        paymentMethodsWidget.updateAmount(price);
    }, [price]);

    const handlePayment = async () => {
        const paymentWidget = paymentWidgetRef.current;

        try {
            await paymentWidget?.requestPayment({
                orderId: nanoid(),
                orderName: orderName,
                customerName: 'SajuChain Guest',
                customerEmail: 'guest@sajuchain.com',
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
            });
        } catch (error) {
            console.error('Payment Error', error);
        }
    };

    return (
        <div className="w-full">
            <div id="payment-widget" className="w-full" />
            <div id="agreement" className="w-full" />
            <button
                onClick={handlePayment}
                className="w-full py-4 mt-4 rounded-xl bg-[#3182F6] text-white font-bold text-lg hover:bg-[#2c75dc] transition-colors shadow-lg"
            >
                {price.toLocaleString()}원 결제하기
            </button>
        </div>
    );
}
