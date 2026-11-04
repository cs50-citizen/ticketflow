import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import type { EventItem, TicketTier, User } from '../types';
import { api } from '../api/client';

interface EventDetailPageProps {
  event: EventItem;
  user: User | null;
  onBack: () => void;
  onOpenAuth: () => void;
  onOrderCreated: (order: any) => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  event,
  user,
  onBack,
  onOpenAuth,
  onOrderCreated,
}) => {
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(
    event.ticketTiers && event.ticketTiers.length > 0 ? event.ticketTiers[0] : null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBooking = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!selectedTier) return;

    setError(null);
    setLoading(true);

    try {
      const order = await api.orders.create(event.id, selectedTier.id, quantity);
      onOrderCreated(order);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to reserve tickets. Inventory might have changed due to high concurrency.'
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = selectedTier ? selectedTier.price * quantity : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to all events</span>
      </button>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="h-64 sm:h-80 w-full relative">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-lg mb-3 inline-block">
              {event.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{event.title}</h1>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Details Column */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-2">About the Event</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{event.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center space-x-3 text-sm text-slate-200">
                <Calendar className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Date &amp; Time</div>
                  <div className="text-xs text-slate-400">{formatDate(event.startTime)}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-200">
                <MapPin className="h-5 w-5 text-rose-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Venue &amp; Location</div>
                  <div className="text-xs text-slate-400">
                    {event.venue}, {event.city}
                  </div>
                </div>
              </div>
            </div>

            {/* Concurrency Guarantee Alert */}
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300">
              <ShieldCheck className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Guaranteed Zero-Oversell:</span>
                <span className="text-slate-400 ml-1">
                  Once you reserve, your tickets are atomically locked at the database layer with a 10-minute payment countdown window.
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Booking Box */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 h-fit space-y-6">
            <h3 className="text-base font-bold text-white">Select Ticket Tier</h3>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              {event.ticketTiers.map((tier) => {
                const isSelected = selectedTier?.id === tier.id;
                const isSoldOut = tier.availableCapacity <= 0;

                return (
                  <div
                    key={tier.id}
                    onClick={() => !isSoldOut && setSelectedTier(tier)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSoldOut
                        ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-900/40'
                        : isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 shadow-sm shadow-indigo-500/20'
                        : 'border-slate-700 bg-slate-900/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white">{tier.name}</span>
                      <span className="text-sm font-bold text-indigo-300">${tier.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{isSoldOut ? 'Sold Out' : `${tier.availableCapacity} remaining`}</span>
                      {isSelected && <Check className="h-4 w-4 text-indigo-400" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity Selector */}
            {selectedTier && selectedTier.availableCapacity > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Quantity</label>
                <div className="flex items-center space-x-3">
                  {[1, 2, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={num > selectedTier.availableCapacity}
                      onClick={() => setQuantity(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                        quantity === num
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Total and CTA */}
            <div className="pt-4 border-t border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Price</span>
                <span className="text-xl font-extrabold text-white">${totalPrice}</span>
              </div>

              <button
                onClick={handleBooking}
                disabled={loading || !selectedTier || selectedTier.availableCapacity <= 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
              >
                {loading
                  ? 'Atomically Locking Tickets...'
                  : user
                  ? 'Reserve Tickets Now'
                  : 'Sign In to Reserve'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
