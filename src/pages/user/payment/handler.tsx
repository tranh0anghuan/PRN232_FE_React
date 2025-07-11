import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { membershipService } from "@/services/membership-plan/service";

export default function PaymentHandler() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Get query parameters
    const token = searchParams.get('token');
    const PayerID = searchParams.get('PayerID');
    const paymentId = searchParams.get('paymentId');
    const status = searchParams.get('status');

    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | 'error' | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handlePayment = async () => {
            try {
                setLoading(true);

                // Check if payment was cancelled
                if (status === 'cancelled' || location.pathname.includes('cancelled')) {
                    if (paymentId) {
                        await membershipService.cancel(Number(paymentId), token);
                    }
                    setPaymentStatus('cancelled');
                    setMessage('Payment was cancelled. You can try again anytime.');
                    return;
                }

                // Check if payment was successful
                if (token && PayerID && paymentId) {
                    const response = await membershipService.success(Number(paymentId), token);

                    if (response.code === 200) {
                        setPaymentStatus('success');
                        setMessage('Payment successful! Your membership plan has been activated.');
                    } else {
                        setPaymentStatus('error');
                        setMessage(response.message || 'Payment verification failed. Please contact support.');
                    }
                } else {
                    setPaymentStatus('error');
                    setMessage('Invalid payment parameters. Please try again.');
                }
            } catch (error) {
                console.error('Payment handling error:', error);
                setPaymentStatus('error');
                setMessage('An error occurred while processing your payment. Please contact support.');
            } finally {
                setLoading(false);
            }
        };

        handlePayment().catch(console.error);
    }, [token, PayerID, paymentId, status, location.pathname]);

    const handleReturnHome = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Processing Payment
                        </h2>
                        <p className="text-gray-600 text-center">
                            Please wait while we verify your payment...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const renderIcon = () => {
        switch (paymentStatus) {
            case 'success':
                return <CheckCircle className="h-16 w-16 text-green-500" />;
            case 'cancelled':
                return <XCircle className="h-16 w-16 text-yellow-500" />;
            case 'error':
                return <AlertCircle className="h-16 w-16 text-red-500" />;
            default:
                return <AlertCircle className="h-16 w-16 text-gray-500" />;
        }
    };

    const renderTitle = () => {
        switch (paymentStatus) {
            case 'success':
                return 'Payment Successful!';
            case 'cancelled':
                return 'Payment Cancelled';
            case 'error':
                return 'Payment Error';
            default:
                return 'Payment Status';
        }
    };

    const renderButtons = () => {
        switch (paymentStatus) {
            case 'success':
                return (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={handleReturnHome}
                            className="!bg-green-600 !hover:bg-green-700"
                        >
                            Return to Home
                        </Button>
                    </div>
                );
            case 'cancelled':
                return (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={handleReturnHome}
                            variant="outline"
                        >
                            Return to Home
                        </Button>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Contact Support
                        </Button>
                        <Button
                            variant="outline"
                        >
                            Try Again
                        </Button>
                    </div>
                );
            default:
                return (
                    <Button
                        onClick={handleReturnHome}
                        variant="outline"
                    >
                        Return to Home
                    </Button>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {renderIcon()}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {renderTitle()}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-gray-600">
                        {message}
                    </p>

                    {/* Payment Details */}
                    {paymentStatus === 'success' && (
                        <div className="!bg-green-50 !border !border-green-200 rounded-lg p-4">
                            <h3 className="font-semibold text-green-800 mb-2">
                                Payment Details
                            </h3>
                            <div className="text-sm text-green-700 space-y-1">
                                {paymentId && <p>Payment ID: {paymentId}</p>}
                                {token && <p>Transaction: {token}</p>}
                            </div>
                        </div>
                    )}

                    {/* Error Details */}
                    {paymentStatus === 'error' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="font-semibold text-red-800 mb-2">
                                Need Help?
                            </h3>
                            <p className="text-sm text-red-700">
                                If you continue to experience issues, please contact our support team with your payment details.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4">
                        {renderButtons()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}