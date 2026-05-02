WITH category_map AS (
  SELECT id, name FROM categories
)

INSERT INTO materials (category_id, name)
SELECT c.id, m.name
FROM category_map c
JOIN (
  VALUES
    -- Devices - Receptacles
    ('Devices - Receptacles', 'Receptacle'),
    ('Devices - Receptacles', 'GFCI Receptacle'),
    ('Devices - Receptacles', 'USB (Type A/C) Receptacle'),
    ('Devices - Receptacles', 'Weatherproof Receptacle'),
    ('Devices - Receptacles', '240V Receptacle'),

    -- Devices - Switches & Controls
    ('Devices - Switches & Controls', 'Single Pole Switch'),
    ('Devices - Switches & Controls', '3-Way Switch'),
    ('Devices - Switches & Controls', '4-Way Switch'),
    ('Devices - Switches & Controls', 'Dimmer Switch'),
    ('Devices - Switches & Controls', 'Decora Style Device Upcharge'),
    ('Devices - Switches & Controls', 'Switch Location for Low-Volt LED Lighting'),

    -- Lighting - Fixtures & Trim
    ('Lighting - Fixtures & Trim', 'Can Light Trims'),
    ('Lighting - Fixtures & Trim', 'Can Light'),
    ('Lighting - Fixtures & Trim', 'Canless Light'),
    ('Lighting - Fixtures & Trim', 'Closet Lights'),
    ('Lighting - Fixtures & Trim', 'Light Fixture Install'),
    ('Lighting - Fixtures & Trim', 'Chandolier Rough-In'),
    ('Lighting - Fixtures & Trim', 'Chandolier Install'),
    ('Lighting - Fixtures & Trim', 'Puck Light'),
    ('Lighting - Fixtures & Trim', 'Pendant Light'),
    ('Lighting - Fixtures & Trim', 'Sconse Light'),

    -- Lighting - Low Voltage
    ('Lighting - Low Voltage', 'COB Tape Lighting Section (up to 4")'),
    ('Lighting - Low Voltage', 'Tape Lighting Additional Footage (ft)'),

    -- Fans & Ventilation
    ('Fans & Ventilation', 'Ceiling Fan Rough-In'),
    ('Fans & Ventilation', 'Ceiling Fan Box Install'),
    ('Fans & Ventilation', 'Bathroom Exhaust Fan/Light Combo 60 CFM'),
    ('Fans & Ventilation', 'Bathroom Exhaust Fan/Light Combo 100 CFM'),

    -- Detection & Safety
    ('Detection & Safety', 'Smoke Detector'),
    ('Detection & Safety', 'Smoke/CO2 Combo Detector'),

    -- Circuits
    ('Circuits', '15A 14-2 Home Run'),
    ('Circuits', '20A 12-2 Home Run'),
    ('Circuits', '30A 10-2 Home Run'),
    ('Circuits', '30A 10-3 Home Run'),
    ('Circuits', '50A 8-2 Home Run'),
    ('Circuits', '50A 8-3 Home Run'),

    -- Panels & Service
    ('Panels & Service', '60A Outdoor Disconnect'),
    ('Panels & Service', 'Add 100A Sub Panel'),
    ('Panels & Service', '#2 AL SER Cable to Sub Panel (ft)'),

    -- Low Voltage
    ('Low Voltage', 'CAT6 Ethernet Run'),
    ('Low Voltage', 'RG6 Coaxial Cable Run'),

    -- Boxes
    ('Boxes', 'Round Cut-In Box'),
    ('Boxes', '4" Pancake Box'),

    -- Covers
    ('Covers', 'Receptacle Covers'),
    ('Covers', '1-Gang Blank Covers'),
    ('Covers', '1-Gang Switch Covers'),
    ('Covers', '2-Gang Switch Covers'),
    ('Covers', '3-Gang Switch Covers'),
    ('Covers', '4-Gang Switch Covers'),
    ('Covers', 'Blank Ceiling Box Covers'),
    ('Covers', 'Specialty Covers')

) AS m(category_name, name)
ON c.name = m.category_name;
