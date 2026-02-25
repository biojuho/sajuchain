'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Lock, RefreshCw, Users, TrendingUp, CreditCard } from 'lucide-react';

interface Stats {
    totalUsers: number;
    todayCount: number;
}

interface RecordType {
    id: string;
    created_at: string;
    saju_data?: { dayMaster: string };
    gender: string;
    birth_date: string;
    birth_time?: string;
    birth_place?: string;
}

interface UserType {
    id: string;
    email?: string;
    created_at: string;
    last_sign_in_at?: string;
}

interface PaymentType {
    id: string;
    payment_key: string;
    order_id: string;
    amount: number;
    status: string;
    created_at: string;
}

export default function AdminPage() {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Tab State
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments'>('overview');

    // Data State
    const [stats, setStats] = useState<Stats | null>(null);
    const [records, setRecords] = useState<RecordType[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [payments, setPayments] = useState<PaymentType[]>([]);
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData(password);
    };

    const fetchData = async (pwd?: string) => {
        setLoading(true);
        setError('');
        const currentPassword = pwd || password;

        try {
            const authHeaders = {
                'Authorization': `Bearer ${currentPassword}`,
            };

            // 1. Fetch Overview Stats (Authentication Check)
            const statsRes = await fetch('/api/admin/stats', { headers: authHeaders });
            if (statsRes.status === 401) {
                throw new Error('Unauthorized');
            }
            if (!statsRes.ok) throw new Error('Failed to fetch stats');
            const statsData = await statsRes.json();
            setStats(statsData.stats);
            setRecords(statsData.records);

            // 2. Fetch Users
            const usersRes = await fetch('/api/admin/users', { headers: authHeaders });
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData.users || []);
            }

            // 3. Fetch Payments
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
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                <GlassCard className="w-full max-w-sm p-8 flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white/50" />
                    </div>
                    <h1 className="text-xl font-bold">Joolife Admin</h1>
                    <form onSubmit={handleLogin} className="w-full space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                        />
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            로그인
                        </button>
                    </form>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Joolife Admin</h1>
                        <p className="text-white/50 text-sm">사주체인 서비스 관리자</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="flex bg-white/5 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                            >
                                Users
                            </button>
                            <button
                                onClick={() => setActiveTab('payments')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'payments' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                            >
                                Payments
                            </button>
                        </div>
                        <button
                            onClick={() => fetchData()}
                            aria-label="Refresh Data"
                            className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </header>

                {/* Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                         {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <GlassCard className="p-6 flex flex-col gap-2">
                                <span className="text-white/50 text-sm flex items-center gap-2">
                                    <Users className="w-4 h-4" /> 총 사용자
                                </span>
                                <span className="text-3xl font-bold">{stats?.totalUsers || 0}</span>
                            </GlassCard>
                            <GlassCard className="p-6 flex flex-col gap-2">
                                <span className="text-white/50 text-sm flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> 오늘 생성
                                </span>
                                <span className="text-3xl font-bold">{stats?.todayCount || 0}</span>
                            </GlassCard>
                             <GlassCard className="p-6 flex flex-col gap-2">
                                <span className="text-white/50 text-sm flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" /> 총 매출 (건수)
                                </span>
                                <span className="text-3xl font-bold">{payments.length}</span>
                            </GlassCard>
                        </div>

                        {/* Recent Records Table */}
                        <GlassCard className="p-6">
                            <h2 className="text-lg font-bold mb-4">최근 생성 기록 (Recent 50)</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-white/40 border-b border-white/10">
                                        <tr>
                                            <th className="py-3 px-4">Time</th>
                                            <th className="py-3 px-4">Day Master</th>
                                            <th className="py-3 px-4">User Info</th>
                                            <th className="py-3 px-4">Location</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {records.map((rec: RecordType) => (
                                            <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 font-mono text-white/70">
                                                    {new Date(rec.created_at).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-block px-2 py-1 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                                                        {rec.saju_data?.dayMaster}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-white/70">
                                                    {rec.gender === 'male' ? '남' : '여'} / {rec.birth_date} / {rec.birth_time || 'Unknown'}
                                                </td>
                                                <td className="py-3 px-4 text-white/50">
                                                    {rec.birth_place}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {activeTab === 'users' && (
                    <GlassCard className="p-6">
                        <h2 className="text-lg font-bold mb-4">Registered Users</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-white/40 border-b border-white/10">
                                    <tr>
                                        <th className="py-3 px-4">ID</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Created At</th>
                                        <th className="py-3 px-4">Last Sign In</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 font-mono text-white/50 text-xs">
                                                {user.id}
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.email}
                                            </td>
                                            <td className="py-3 px-4 text-white/70">
                                                {new Date(user.created_at).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-white/70">
                                                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                )}

                {activeTab === 'payments' && (
                    <GlassCard className="p-6">
                        <h2 className="text-lg font-bold mb-4">Payment History</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-white/40 border-b border-white/10">
                                    <tr>
                                        <th className="py-3 px-4">Time</th>
                                        <th className="py-3 px-4">Payment Key</th>
                                        <th className="py-3 px-4">Amount</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Order ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-white/30">
                                                결제 내역이 없습니다. (Payment Verification API 연동 필요)
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((pay) => (
                                            <tr key={pay.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 text-white/70">
                                                    {new Date(pay.created_at).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-xs text-white/50">
                                                    {pay.payment_key}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-green-400">
                                                    ₩{pay.amount.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${pay.status === 'DONE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {pay.status}
                                                    </span>
                                                </td>
                                                 <td className="py-3 px-4 font-mono text-xs text-white/30">
                                                    {pay.order_id}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
