import React, {useState, useEffect, type JSX} from 'react';
import { CheckCircle, User, FileText, Activity, CreditCard, Calendar, DollarSign, Hash, UserCheck } from 'lucide-react';

import { membershipService } from "@/services/membership-plan/service";

export interface Payment {
    paymentId: number;
    username: string;
    membershipId: number;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    status: string;
    paymentDate: string;
}

interface Stats {
    total: number;
    completed: number;
    pending: number;
    failed: number;
}

const PaymentManagement: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0
    });

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await membershipService.getAllPayment();
            if (response.code === 200) {
                setPayments(response.data);
                calculateStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (paymentData: Payment[]): void => {
        const newStats: Stats = {
            total: paymentData.length,
            completed: paymentData.filter(p => p.status === 'Success').length,
            pending: paymentData.filter(p => p.status === 'Pending').length,
            failed: paymentData.filter(p => p.status === 'Canceled').length
        };
        setStats(newStats);
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string): JSX.Element => {
        const statusConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
            'Success': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Activity },
            'Canceled': { color: 'bg-red-100 text-red-800', icon: Activity }
        };

        const config = statusConfig[status] || statusConfig['Pending'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Thanh toán</h1>
                    <p className="text-gray-600">Quản lý các giao dịch thanh toán trong hệ thống</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Tổng giao dịch</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Thành công</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100">
                                <Activity className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Đang xử lý</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100">
                                <Activity className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Thất bại</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.failed}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Danh sách giao dịch</h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Đang tải...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <Hash className="w-4 h-4 mr-1" />
                                            ID Giao dịch
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <UserCheck className="w-4 h-4 mr-1" />
                                            Tên người dùng
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <FileText className="w-4 h-4 mr-1" />
                                            Gói thành viên
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            Số tiền
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <CreditCard className="w-4 h-4 mr-1" />
                                            Phương thức
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <Hash className="w-4 h-4 mr-1" />
                                            Mã giao dịch
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <Activity className="w-4 h-4 mr-1" />
                                            Trạng thái
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Thời gian
                                        </div>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            Không tìm thấy giao dịch nào
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment.paymentId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{payment.paymentId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="ml-2">
                                                        {payment.username}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                Gói #{payment.membershipId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(payment.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {payment.paymentMethod}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {payment.transactionId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {getStatusBadge(payment.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(payment.paymentDate)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Results Summary */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <span>Hiển thị {payments.length} giao dịch</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentManagement;