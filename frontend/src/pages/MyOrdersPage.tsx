import React, { useEffect, useState } from 'react';
import { Ticket, QrCode, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Order } from '../types';
import { api } from '../api/client';
import { CountdownTimer } from '../components/CountdownTimer';

interface MyOrdersPageProps {
  onPayOrder: (order: Order) => void;
  onExploreEvents: () => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onPayOrder, onExploreEvents }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const list = await api.orders.list();
      setOrders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>CONFIRMED</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-3.5 w-3.5" />
            <span>HOLD PENDING</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>EXPIRED</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent" />
        <p className="mt-3 text-sm">Loading your tickets from PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Tickets &amp; Bookings</h1>
          <p className="text-xs sm:text-sm text-slate-400">View and manage your active admission passes</p>
        </div>
        <button
          onClick={onExploreEvents}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
        >
          <span>Find More Events</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <Ticket className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No tickets yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not booked any tickets yet. Explore active concerts and conferences to test the system!
          </p>
          <button
            onClick={onExploreEvents}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
          >
            Explore Events
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPending = order.status === 'PENDING';

            return (
              <div
                key={order.orderId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 transition"
              >
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(order.status)}
                    <span className="font-mono text-xs text-slate-400">#{order.orderNumber}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{order.eventTitle}</h3>
                  <p className="text-xs text-slate-400">{order.venue}</p>

                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    {order.items.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {item.quantity}x {item.tierName} (${item.unitPrice} each)
                      </span>
                    ))}
                  </div>

                  {isPending && (
                    <div className="pt-2">
                      <CountdownTimer expiresAt={order.expiresAt} />
                    </div>
                  )}
                </div>

                {/* Right Action / QR Code */}
                <div className="flex md:flex-col items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total</span>
                    <div className="text-xl font-bold text-indigo-400">${order.totalAmount}</div>
                  </div>

                  {order.status === 'CONFIRMED' ? (
                    <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <QrCode className="h-4 w-4" />
                      <span>Valid Admission Pass</span>
                    </div>
                  ) : isPending ? (
                    <button
                      onClick={() => onPayOrder(order)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
                    >
                      Complete Payment
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
