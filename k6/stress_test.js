import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Load Test Configuration: Ramp up to 500 concurrent virtual users
export const options = {
  stages: [
    { duration: '10s', target: 50 },  // warm-up
    { duration: '30s', target: 300 }, // rush hour spike
    { duration: '10s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'], // 95% of requests must complete below 100ms
    http_req_failed: ['rate<0.01'],   // 5xx errors must be below 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080/api/v1';

export default function () {
  // 1. Browse active events
  const eventsRes = http.get(`${BASE_URL}/events`);
  check(eventsRes, {
    'events fetched successfully (200)': (r) => r.status === 200,
  });

  // 2. Simulate User Login
  const loginPayload = JSON.stringify({
    email: 'demo@ticketflow.io',
    password: 'password123',
  });

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status === 200) {
    const token = JSON.parse(loginRes.body).data.token;

    // 3. Compete for ticket reservation
    const bookPayload = JSON.stringify({
      eventId: 1,
      ticketTierId: 1,
      quantity: 1,
    });

    const bookRes = http.post(`${BASE_URL}/orders`, bookPayload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    // Valid business outcome: Either 200 (Reserved) or 409 (Sold Out). NEVER 500.
    check(bookRes, {
      'booking handled gracefully (200 or 409)': (r) => r.status === 200 || r.status === 409,
    });
  }

  sleep(0.5);
}

