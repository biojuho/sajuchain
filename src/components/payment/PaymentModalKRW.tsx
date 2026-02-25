'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TossPaymentWidget from '../payment/TossPaymentWidget';

interface PaymentModalKRWProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PaymentModalKRW({ isOpen, onClose }: PaymentModalKRWProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[450px] bg-white text-gray-900 rounded-2xl p-6 z-[51] shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="text-center mb-6">
                            <div className="text-3xl mb-2">🎁</div>
                            <h2 className="text-xl font-bold mb-1">프리미엄 정밀 분석</h2>
                            <p className="text-gray-500 text-sm">
                                자평진전 AI 심층 분석 + 2026년 신년운세<br />
                                <span className="text-purple-600 font-bold">단돈 990원</span>으로 확인하세요.
                            </p>
                        </div>

                        {/* Toss Payments Widget */}
                        <TossPaymentWidget price={990} orderName="SajuChain Premium" />

                        <button
                            onClick={onClose}
                            className="w-full mt-4 py-3 rounded-xl text-gray-500 font-medium hover:bg-gray-100 transition-colors"
                        >
                            닫기
                        </button>

                        <p className="mt-6 text-[10px] text-gray-400 text-center">
                            Joolife | 대표: 박주호 | 이메일: joolife@joolife.io.kr<br />
                            이용약관 및 개인정보처리방침에 동의합니다.
                        </p>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

