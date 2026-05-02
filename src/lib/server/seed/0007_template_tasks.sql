INSERT INTO template_tasks (
  template_id,
  description,
  "order"
)
SELECT
  jt.id,
  task.description,
  task."order"
FROM job_templates jt
JOIN (
  VALUES
    ('Test all receptacles', 10),
    ('Test all GFCI receptacles and protected receptacles', 20),
    ('Test all switches. Test 3-way and 4-way switches in all positions', 30),
    ('Test smoke detectors and verify other smoke detectors in house are connected', 40),
    ('Verify all circuits are turned on', 50)
) AS task(description, "order")
  ON true
WHERE jt.name = 'Finish / Remodel';
