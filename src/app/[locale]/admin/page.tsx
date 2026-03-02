'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Lock, RefreshCw, Users, TrendingUp, CreditCard } from 'lucide-react';
import { useAdminData, type SajuRecord, type AdminUser, type Payment } from '@/hooks/useAdminData';

export default function AdminPage() {
    const {
        isAuthenticated,
        password,
        setPassword,
        error,
        handleLogin,
        activeTab,
        setActiveTab,
        stats,
        records,
        users,
        payments,
        loading,
        fetchData,
        completedPayments,
        totalRevenue,
    } = useAdminData();

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
                            {(['overview', 'users', 'payments'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
                                >
                                    {tab === 'overview' ? 'Overview' : tab === 'users' ? 'Users' : 'Payments'}
                                </button>
                            ))}
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
                    <OverviewTab
                        stats={stats}
                        records={records}
                        completedPaymentCount={completedPayments.length}
                        totalRevenue={totalRevenue}
                    />
                )}

                {activeTab === 'users' && <UsersTab users={users} />}

                {activeTab === 'payments' && <PaymentsTab payments={payments} />}
            </div>
        </div>
    );
}

/* ── Sub-components (logic/UI separation) ── */

function OverviewTab({
    stats,
    records,
    completedPaymentCount,
    totalRevenue,
}: {
    stats: { totalUsers: number; todayCount: number } | null;
    records: SajuRecord[];
    completedPaymentCount: number;
    totalRevenue: number;
}) {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Users className="w-4 h-4" />} label="총 사용자" value={stats?.totalUsers || 0} />
                <StatCard icon={<TrendingUp className="w-4 h-4" />} label="오늘 생성" value={stats?.todayCount || 0} />
                <StatCard icon={<CreditCard className="w-4 h-4" />} label="결제 건수" value={completedPaymentCount} />
                <StatCard
                    icon={<CreditCard className="w-4 h-4" />}
                    label="총 매출"
                    value={`₩${totalRevenue.toLocaleString()}`}
                    valueClassName="text-green-400"
                />
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
                            {records.map((rec) => (
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
    );
}

function UsersTab({ users }: { users: AdminUser[] }) {
    return (
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
                                <td className="py-3 px-4 font-mono text-white/50 text-xs">{user.id}</td>
                                <td className="py-3 px-4">{user.email}</td>
                                <td className="py-3 px-4 text-white/70">{new Date(user.created_at).toLocaleString()}</td>
                                <td className="py-3 px-4 text-white/70">
                                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
}

function PaymentsTab({ payments }: { payments: Payment[] }) {
    return (
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
                                    결제 내역이 없습니다.
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
    );
}

function StatCard({
    icon,
    label,
    value,
    valueClassName = '',
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    valueClassName?: string;
}) {
    return (
        <GlassCard className="p-6 flex flex-col gap-2">
            <span className="text-white/50 text-sm flex items-center gap-2">
                {icon} {label}
            </span>
            <span className={`text-3xl font-bold ${valueClassName}`}>{value}</span>
        </GlassCard>
    );
}
