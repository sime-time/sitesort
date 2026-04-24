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
    ('Devices - Receptacles', '240V (30A/50A) Receptacle'),

    -- Devices - Switches & Controls
    ('Devices - Switches & Controls', 'Single Pole Switch'),
    ('Devices - Switches & Controls', '3-Way Switch'),
    ('Devices - Switches & Controls', '4-Way Switch'),
    ('Devices - Switches & Controls', 'Dimmer Switch'),
    ('Devices - Switches & Controls', 'Decora Style Device Upcharge'),
    ('Devices - Switches & Controls', 'Switch Location for Low-Volt LED Lighting'),

    -- Lighting - Fixtures & Trim
    ('Lighting - Fixtures & Trim', 'Can Light Trims'),
    ('Lighting - Fixtures & Trim', 'LED Can or Canless Light 4"'),
    ('Lighting - Fixtures & Trim', 'LED Can or Canless Light 6"'),
    ('Lighting - Fixtures & Trim', 'Closet Lights'),
    ('Lighting - Fixtures & Trim', 'Light Bulbs'),
    ('Lighting - Fixtures & Trim', 'Light Fixture Rough-In'),
    ('Lighting - Fixtures & Trim', 'Light Fixture Install'),
    ('Lighting - Fixtures & Trim', 'LED Puck Light'),

    -- Lighting - Tape Systems
    ('Lighting - Tape Systems', 'LED COB Tape Lighting Section (up to 4'')'),
    ('Lighting - Tape Systems', 'LED Tape Lighting Additional Footage (ft)'),

    -- Fans & Ventilation
    ('Fans & Ventilation', 'Ceiling Fan Rough-In'),
    ('Fans & Ventilation', 'Ceiling Fan Install'),
    ('Fans & Ventilation', 'Bathroom Exhaust Fan/Light Combo 60 CFM'),
    ('Fans & Ventilation', 'Bathroom Exhaust Fan/Light Combo 100 CFM'),
    ('Fans & Ventilation', 'Bathroom Exhaust Fan Ducting'),
    ('Fans & Ventilation', 'Exhaust Fan Trim'),

    -- Detection & Safety
    ('Detection & Safety', 'Smoke Detector'),
    ('Detection & Safety', 'Smoke/CO2 Combo Detector'),

    -- Circuits - Home Runs
    ('Circuits - Home Runs', '15A 14-2 Home Run'),
    ('Circuits - Home Runs', '20A 12-2 Home Run'),
    ('Circuits - Home Runs', '30A 10-2 Home Run'),
    ('Circuits - Home Runs', '30A 10-3 Home Run'),
    ('Circuits - Home Runs', '50A 8-2 Home Run'),
    ('Circuits - Home Runs', '50A 8-3 Home Run'),

    -- Panels & Service
    ('Panels & Service', '60A Outdoor Disconnect'),
    ('Panels & Service', 'Add 100A Sub Panel'),
    ('Panels & Service', '#2 AL SER Cable to Sub Panel (ft)'),

    -- Low Voltage
    ('Low Voltage', 'CAT6 Ethernet Run'),
    ('Low Voltage', 'RG6 Coaxial Cable Run'),

    -- Boxes & Covers
    ('Boxes & Covers', 'Round Cut-In Box'),
    ('Boxes & Covers', '4" Pancake Box'),
    ('Boxes & Covers', 'Receptacle Covers'),
    ('Boxes & Covers', 'Single Gang Switch Covers'),
    ('Boxes & Covers', '2-Gang Switch Covers'),
    ('Boxes & Covers', '3-Gang Switch Covers'),
    ('Boxes & Covers', '4-Gang Switch Covers'),
    ('Boxes & Covers', 'Single Gang Blank Covers'),
    ('Boxes & Covers', 'Blank Ceiling Box Covers'),
    ('Boxes & Covers', 'Specialty Covers'),

    -- Custom / Miscellaneous
    ('Miscellaneous', 'Custom Material')
) AS m(category_name, name)
ON c.name = m.category_name;
