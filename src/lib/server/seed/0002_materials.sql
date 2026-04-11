WITH category_map AS (
  SELECT id, name FROM categories
)

INSERT INTO materials (category_id, name)
SELECT c.id, m.name
FROM category_map c
JOIN (
  VALUES
    -- Lighting
    ('Lighting', 'Can Light Trims'),
    ('Lighting', 'Canless Lights 6"'),
    ('Lighting', 'Canless Lights 4"'),
    ('Lighting', 'Closet Lights'),
    ('Lighting', 'Light Bulbs'),

    -- Receptacles
    ('Receptacles', 'Receptacles'),
    ('Receptacles', 'GFCI Receptacles'),
    ('Receptacles', 'USB Receptacles'),

    -- Switches
    ('Switches', 'Single Pole Switches'),
    ('Switches', '3-Way Switches'),
    ('Switches', '4-Way Switches'),
    ('Switches', 'Dimmer Switches'),

    -- Detectors
    ('Detectors', 'Smoke Detectors'),
    ('Detectors', 'Smoke / CO2 Combos'),

    -- Boxes
    ('Boxes', 'Round Cut-In Box'),
    ('Boxes', '4" Pancake Box'),

    -- Covers / Plates
    ('Covers / Plates', 'Receptacle Covers'),
    ('Covers / Plates', 'Single Gang Switch Covers'),
    ('Covers / Plates', '2-Gang Switch Covers'),
    ('Covers / Plates', '3-Gang Switch Covers'),
    ('Covers / Plates', '4-Gang Switch Covers'),
    ('Covers / Plates', 'Single Gang Blank Covers'),
    ('Covers / Plates', 'Blank Ceiling Box Covers'),
    ('Covers / Plates', 'Specialty Covers'),

    -- Ventilation
    ('Ventilation', 'Exhaust Fan Trim'),

    -- Misc
    ('Miscellaneous', 'Custom Material')
) AS m(category_name, name)
ON c.name = m.category_name;
