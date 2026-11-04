-- Seed realistic events and tiers for demonstration & load testing

INSERT INTO events (title, description, venue, city, category, image_url, start_time, end_time, status)
VALUES 
(
    'Coldplay: Music of the Spheres World Tour',
    'Experience the mesmerizing visual spectacle and timeless anthems live at Accor Stadium.',
    'Accor Stadium, Sydney Olympic Park',
    'Sydney',
    'Concert',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    CURRENT_TIMESTAMP + INTERVAL '14 days',
    CURRENT_TIMESTAMP + INTERVAL '14 days 4 hours',
    'ACTIVE'
),
(
    'AWS Cloud Tech Summit 2026',
    'The premier cloud computing conference connecting builders, architects, and engineering leaders.',
    'International Convention Centre (ICC)',
    'Sydney',
    'Conference',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    CURRENT_TIMESTAMP + INTERVAL '31 days',
    'ACTIVE'
),
(
    'Formula 1 Australian Grand Prix',
    'High-octane motorsport racing returns to the scenic lakeside Albert Park circuit.',
    'Albert Park Grand Prix Circuit',
    'Melbourne',
    'Sports',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    CURRENT_TIMESTAMP + INTERVAL '45 days',
    CURRENT_TIMESTAMP + INTERVAL '47 days',
    'ACTIVE'
);

-- Ticket Tiers for Event 1 (Coldplay)
INSERT INTO ticket_tiers (event_id, name, price, total_capacity, available_capacity)
VALUES 
(1, 'General Admission Standing', 149.00, 5000, 5000),
(1, 'A-Reserve Seated', 229.00, 3000, 3000),
(1, 'VIP Floris Early Entry', 399.00, 500, 500);

-- Ticket Tiers for Event 2 (AWS Summit)
INSERT INTO ticket_tiers (event_id, name, price, total_capacity, available_capacity)
VALUES 
(2, 'Standard Pass', 299.00, 2000, 2000),
(2, 'Developer All-Access + Workshop', 599.00, 800, 800);

-- Ticket Tiers for Event 3 (F1 GP)
INSERT INTO ticket_tiers (event_id, name, price, total_capacity, available_capacity)
VALUES 
(3, 'Park Pass 4-Day', 195.00, 10000, 10000),
(3, 'Brabham Grandstand', 485.00, 1500, 1500),
(3, 'Paddock Club Hospitality', 1850.00, 200, 200);
