import React, { useState } from 'react';
import { Calendar, MapPin, Search, ArrowRight } from 'lucide-react';
import type { EventItem } from '../types';

interface EventListPageProps {
  events: EventItem[];
  loading: boolean;
  onSelectEvent: (event: EventItem) => void;
}

export const EventListPage: React.FC<EventListPageProps> = ({ events, loading, onSelectEvent }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Concert', 'Conference', 'Sports'];

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-AU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLowestPrice = (event: EventItem) => {
    if (!event.ticketTiers || event.ticketTiers.length === 0) return 0;
    return Math.min(...event.ticketTiers.map((t) => t.price));
  };

  const getTotalAvailable = (event: EventItem) => {
    if (!event.ticketTiers || event.ticketTiers.length === 0) return 0;
    return event.ticketTiers.reduce((acc, t) => acc + t.availableCapacity, 0);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-2">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Experience Live Events with <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            Real-Time Atomic Booking
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Powered by Java 21, Spring Boot 3, and PostgreSQL with zero-oversell concurrency guarantees.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, city or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent align-[-0.125em]" />
          <p className="mt-3 text-sm">Loading events from Spring Boot API...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-sm">No events match your current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const lowestPrice = getLowestPrice(event);
            const totalAvailable = getTotalAvailable(event);

            return (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className="group relative bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Event Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30">
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                      {totalAvailable} tickets left
                    </span>
                  </div>
                </div>

                {/* Event Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition line-clamp-1 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{event.description}</p>

                    <div className="space-y-2 text-xs text-slate-300 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <span>{formatDate(event.startTime)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-rose-400 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {event.venue}, {event.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">From</span>
                      <div className="text-lg font-bold text-white">${lowestPrice}</div>
                    </div>
                    <button className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-medium shadow-md transition">
                      <span>Book Now</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
