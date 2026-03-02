'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TossPaymentWidget from '../payment/TossPaymentWidget';

const PREMIUM_BENEFITS = [
    '올해 흐름을 한눈에 보는 요약 리포트',
    '연애, 재물, 일운에서 어디에 힘을 실어야 하는지 정리',
    '대운과 세운을 함께 보는 확장 해석',
];

interface PaymentModalKRWProps {
    isOpen: boolean;
    onClose: () => void;
    resumeActionKey?: string;
    returnToPath?: string;
}

export default function PaymentModalKRW({
    isOpen,
    onClose,
    resumeActionKey,
    returnToPath,
}: PaymentModalKRWProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-[51] max-h-[90vh] w-[90%] max-w-[450px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-2xl"
                    >
                        <div className="mb-6 text-center">
                            <div className="mb-2 text-3xl">사주</div>
                            <h2 className="mb-1 text-xl font-bold">프리미엄 운세 리포트</h2>
                            <p className="text-sm text-gray-500">
                                무료 결과보다 한 단계 더 깊게,
                                <br />
                                <span className="font-bold text-purple-600">올해 흐름과 대운 해석</span>까지 확인해 보세요.
                            </p>
                        </div>

                        <div className="mb-5 space-y-2 rounded-2xl bg-slate-50 p-4 text-left">
                            {PREMIUM_BENEFITS.map((benefit) => (
                                <div key={benefit} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                                    <span>{benefit}</span>
                                </div>
                            ))}
                            <p className="pt-1 text-xs font-semibold text-purple-700">
                                990원으로 바로 열람하고, 결제 후 원래 보던 화면으로 돌아갑니다.
                            </p>
                        </div>

                        <TossPaymentWidget
                            price={990}
                            orderName="SajuChain 올해 운세 리포트"
                            resumeActionKey={resumeActionKey}
                            returnToPath={returnToPath}
                        />

                        <button
                            onClick={onClose}
                            className="mt-4 w-full rounded-xl py-3 font-medium text-gray-500 transition-colors hover:bg-gray-100"
                        >
                            무료 결과로 돌아가기
                        </button>

                        <p className="mt-6 text-center text-[10px] text-gray-400">
                            Joolife | 대표 박주희 | 이메일 joolife@joolife.io.kr
                            <br />
                            결제 진행 시 이용약관 및 개인정보처리방침에 동의한 것으로 봅니다.
                        </p>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
