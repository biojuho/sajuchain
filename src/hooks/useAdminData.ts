'use client';

import { useState, useMemo, useCallback } from 'react';

/* ── Types ── */

interface AdminStats {
    totalUsers: number;
    todayCount: number;
}

interface SajuRecord {
    id: string;
    created_at: string;
    saju_data?: { dayMaster: string };
    gender: string;
    birth_date: string;
    birth_time?: string;
    birth_place?: string;
}

interface AdminUser {
    id: string;
    email?: string;
    created_at: string;
    last_sign_in_at?: string;
}

interface Payment {
    id: string;
    payment_key: string;
    order_id: string;
    amount: number;
    status: string;
    created_at: string;
}

export type { AdminStats, SajuRecord, AdminUser, Payment };

/* ── Hook ── */

export function useAdminData() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments'>('overview');

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [records, setRecords] = useState<SajuRecord[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async (pwd?: string) => {
        setLoading(true);
        setError('');
        const currentPassword = pwd || password;

        try {
            const authHeaders = { Authorization: `Bearer ${currentPassword}` };

            const statsRes = await fetch('/api/admin/stats', { headers: authHeaders });
            if (statsRes.status === 401) throw new Error('Unauthorized');
            if (!statsRes.ok) throw new Error('Failed to fetch stats');

            const statsData = await statsRes.json();
            setStats(statsData.stats);
            setRecords(statsData.records);

            const usersRes = await fetch('/api/admin/users', { headers: authHeaders });
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData.users || []);
            }

            const paymentsRes = await fetch('/api/admin/payments', { headers: authHeaders });
            if (paymentsRes.ok) {
                const paymentsData = await paymentsRes.json();
                setPayments(paymentsData.payments || []);
            }

            setIsAuthenticated(true);
        } catch (e: unknown) {
            console.error(e);
            if (e instanceof Error && e.message === 'Unauthorized') {
                setError('비밀번호가 올바르지 않습니다.');
                setIsAuthenticated(false);
            } else {
                setError('데이터 로딩 실패');
            }
        } finally {
            setLoading(false);
        }
    }, [password]);

    const handleLogin = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        fetchData(password);
    }, [fetchData, password]);

    /* ── Derived (memoized) values ── */

    const completedPayments = useMemo(
        () => payments.filter((p) => p.status === 'DONE'),
        [payments],
    );

    const totalRevenue = useMemo(
        () => completedPayments.reduce((sum, p) => sum + p.amount, 0),
        [completedPayments],
    );

    return {
        // Auth
        isAuthenticated,
        password,
        setPassword,
        error,
        handleLogin,
        // Tab
        activeTab,
        setActiveTab,
        // Data
        stats,
        records,
        users,
        payments,
        loading,
        fetchData,
        // Derived
        completedPayments,
        totalRevenue,
    };
}
