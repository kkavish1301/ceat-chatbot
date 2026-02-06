INSERT INTO knowledge_base (category, question, answer, keywords) VALUES
(
    'Product Information',
    'What types of tyres does CEAT manufacture?',
    'CEAT manufactures a comprehensive range of tyres including: 1) Two-wheeler tyres for motorcycles and scooters, 2) Car and SUV tyres for passenger vehicles, 3) Truck and bus tyres for commercial vehicles, 4) Farm tyres for tractors and agricultural equipment, 5) Specialty tyres for unique applications. Each category offers various models designed for different terrains, weather conditions, and performance requirements.',
    ARRAY['products', 'types', 'range', 'categories']
),
(
    'Technical Support',
    'How do I check my tyre pressure?',
    'To check your tyre pressure: 1) Find the recommended pressure in your vehicle''s manual or on the sticker inside the driver''s door frame, 2) Use a reliable pressure gauge when tyres are cold (not driven for at least 3 hours), 3) Remove the valve cap and press the gauge firmly onto the valve stem, 4) Read the pressure and compare with recommended PSI, 5) Add or release air as needed, 6) Don''t forget to check the spare tyre. Check pressure at least once a month and before long trips.',
    ARRAY['pressure', 'maintenance', 'check', 'psi', 'gauge']
),
(
    'Warranty & Service',
    'What warranty does CEAT provide?',
    'CEAT provides comprehensive warranty coverage on all tyres against manufacturing defects. The standard warranty covers: 1) Manufacturing defects in materials and workmanship, 2) Coverage period varies by tyre type (typically 5-6 years from date of manufacture), 3) Warranty is subject to proper usage and maintenance, 4) Does not cover damage from road hazards, improper inflation, or normal wear.',
    ARRAY['warranty', 'guarantee', 'coverage', 'defects']
),
(
    'Dealer & Service',
    'How can I find a CEAT dealer near me?',
    'You can find your nearest CEAT dealer in several ways: 1) Visit www.ceat.com and use the dealer locator tool, 2) Call CEAT customer care at 1800-123-CEAT (toll-free), 3) Download the CEAT mobile app which has a built-in dealer finder with GPS, 4) Visit any CEAT branded retail outlet or authorized multi-brand tyre shop.',
    ARRAY['dealer', 'service center', 'location', 'near me', 'shop']
);

-- Insert sample update log
INSERT INTO update_logs (update_type, updated_by, changes_count, update_notes)
VALUES ('knowledge_base', 'system', 4, 'Initial knowledge base setup');
