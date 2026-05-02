-- Finish Template
INSERT INTO template_materials (
  template_id,
  material_id,
  default_quantity,
  default_note
)
SELECT
  jt.id,
  m.id,
  0,
  NULL
FROM job_templates jt
JOIN materials m
  ON m.name IN (
    'Can Light Trims',
    'Canless Light',
    'Closet Lights',

    'Receptacle',
    'GFCI Receptacle',
    'USB (Type A/C) Receptacle',

    'Single Pole Switch',
    '3-Way Switch',
    '4-Way Switch',
    'Dimmer Switch',

    'Smoke Detector',
    'Smoke/CO2 Combo Detector',

    'Round Cut-In Box',
    '4" Pancake Box',

    'Receptacle Covers',
    '1-Gang Switch Covers',
    '2-Gang Switch Covers',
    '3-Gang Switch Covers',
    '4-Gang Switch Covers',
    '1-Gang Blank Covers',
    'Blank Ceiling Box Covers',
    'Specialty Covers'
  )
WHERE jt.name = 'Finish / Remodel';


-- New Construction Template
INSERT INTO template_materials (
  template_id,
  material_id,
  default_quantity,
  default_note
)
SELECT
  jt.id,
  m.id,
  0,
  NULL
FROM job_templates jt
JOIN materials m
  ON m.name IN (
    -- Devices - Receptacles
    'Receptacle',
    'GFCI Receptacle',
    'USB (Type A/C) Receptacle',
    'Weatherproof Receptacle',

    -- Devices - Switches & Controls
    'Single Pole Switch',
    '3-Way Switch',
    '4-Way Switch',
    'Dimmer Switch',
    'Decora Style Device Upcharge',
    'Switch Location for Low-Volt LED Lighting',

    -- Low Voltage
    'CAT6 Ethernet Run',
    'RG6 Coaxial Cable Run',

    -- Lighting - Fixtures & Trim
    'Can Light',
    'Canless Light',
    'Light Fixture Install',

    -- Fans & Ventilation
    'Ceiling Fan Rough-In',
    'Ceiling Fan Install',
    'Bathroom Exhaust Fan/Light Combo 60 CFM',
    'Bathroom Exhaust Fan/Light Combo 100 CFM',

    -- Detection & Safety
    'Smoke Detector',
    'Smoke/CO2 Combo Detector',

    -- Circuits
    '15A 14-2 Home Run',
    '20A 12-2 Home Run',
    '30A 10-2 Home Run',
    '30A 10-3 Home Run',
    '50A 8-2 Home Run',
    '50A 8-3 Home Run',

    -- Devices / Appliances
    '240V Receptacle',

    -- Panels & Service
    '60A Outdoor Disconnect',
    'Add 100A Sub Panel',
    '#2 AL SER Cable to Sub Panel (ft)',

    -- Lighting - Low Voltage
    'COB Tape Lighting Section (up to 4")',
    'Tape Lighting Additional Footage (ft)',
    'Puck Light'
  )
WHERE jt.name = 'New Construction';
