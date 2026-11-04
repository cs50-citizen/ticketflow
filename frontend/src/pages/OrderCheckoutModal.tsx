import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';
import type { Order } from '../types';
import { CountdownTimer } from '../components/CountdownTimer';
import { api } from '../api/client';

interface OrderCheckoutModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (confirmedOrder: Order) => void;
}

export const OrderCheckoutModal: React.FC<OrderCheckoutModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handlePay = async () => {
    setError(null);
    setLoading(true);
    try {
      const confirmed = await api.orders.pay(order.orderNumber);
      onPaymentSuccess(confirmed);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const isConfirmed = order.status === 'CONFIRMED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1"
        >
          <X className="h-5 w-5" />
        </button>

        {isConfirmed ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Tickets Confirmed!</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your tickets have been issued and saved to your account. Your order is registered on the ledger.
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
              <span className="text-slate-500">Order Number: </span>
              <span className="font-bold text-indigo-400">{order.orderNumber}</span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
            >
              Done &amp; View Orders
            </button>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
                  Reservation Pending
                </span>
                <CountdownTimer expiresAt={order.expiresAt} />
              </div>
              <h2 className="text-xl font-bold text-white">{order.eventTitle}</h2>
              <p className="text-xs text-slate-400">{order.venue}</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Order Items Breakdown */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-400 pb-1 border-b border-slate-800">
                Ticket Details
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-slate-300">
                  <span>
                    {item.quantity}x {item.tierName}
                  </span>
                  <span className="font-semibold text-white">${item.subtotal}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                <span className="font-bold text-white">Total Amount</span>
                <span className="font-extrabold text-indigo-400 text-base">${order.totalAmount}</span>
              </div>
            </div>

            {/* Simulated Payment Notice */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-indigo-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-white">Mock Checkout Sandbox</span>
                <p className="text-slate-400 text-[11px]">
                  Click below to simulate real-time payment webhook confirmation.
                </p>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition"
            >
              {loading ? 'Confirming Payment...' : `Confirm Payment ($${order.totalAmount})`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
