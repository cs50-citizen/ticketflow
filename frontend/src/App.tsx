import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsBanner } from './components/MetricsBanner';
import { EventListPage } from './pages/EventListPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderCheckoutModal } from './pages/OrderCheckoutModal';
import { AuthModal } from './components/AuthModal';
import { ArchitectureModal } from './pages/ArchitectureModal';
import type { EventItem, Order, User } from './types';
import { api } from './api/client';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [currentView, setCurrentView] = useState<'events' | 'orders'>('events');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [archModalOpen, setArchModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Load user from storage on boot
  useEffect(() => {
    const storedUser = api.auth.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Fetch events
  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await api.events.list();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setCurrentView('events');
  };

  const handleOrderCreated = (order: Order) => {
    setActiveOrder(order);
    setCheckoutModalOpen(true);
    // Refresh events to reflect decremented inventory
    loadEvents();
  };

  const handlePaymentSuccess = (confirmed: Order) => {
    setActiveOrder(confirmed);
    loadEvents();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        currentView={currentView}
        setCurrentView={(view) => {
          setSelectedEvent(null);
          setCurrentView(view);
        }}
        onOpenArchitecture={() => setArchModalOpen(true)}
      />

      <MetricsBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedEvent ? (
          <EventDetailPage
            event={selectedEvent}
            user={user}
            onBack={() => {
              setSelectedEvent(null);
              loadEvents();
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOrderCreated={handleOrderCreated}
          />
        ) : currentView === 'orders' ? (
          <MyOrdersPage
            onPayOrder={(order) => {
              setActiveOrder(order);
              setCheckoutModalOpen(true);
            }}
            onExploreEvents={() => {
              setCurrentView('events');
              setSelectedEvent(null);
            }}
          />
        ) : (
          <EventListPage
            events={events}
            loading={loadingEvents}
            onSelectEvent={(e) => setSelectedEvent(e)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            TicketFlow © 2026. Architected for High Concurrency with Spring Boot 3 &amp; React.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setArchModalOpen(true)}
              className="text-slate-400 hover:text-indigo-400 transition"
            >
              1+2+3 Design Specs
            </button>
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-indigo-400 transition"
            >
              API Reference
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => {
          setUser(u);
        }}
      />

      <ArchitectureModal
        isOpen={archModalOpen}
        onClose={() => setArchModalOpen(false)}
      />

      <OrderCheckoutModal
        order={activeOrder}
        isOpen={checkoutModalOpen}
        onClose={() => {
          setCheckoutModalOpen(false);
          setActiveOrder(null);
          loadEvents();
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default App;
