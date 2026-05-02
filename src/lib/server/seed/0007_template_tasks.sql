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
    ('Dedicated circuits for sump pump and ejector pump', 10),
    ('1 dedicated circuit for back-up sump and ejector alarm', 20),
    ('Check rough-in and finish job specs for extras', 30),
    ('Check local code for arc-fault circuit breaker requirement', 40),
    ('Check for Decora style switches and/or receptacles', 50),
    ('Make count for finish materials', 60),
    ('Test all receptacles', 80),
    ('Test all GFCI receptacles and protected receptacles', 90),
    ('Test all switches. Test 3-way and 4-way switches in all positions', 100),
    ('Test smoke detectors and verify other smoke detectors in house are connected', 110),
    ('Verify all circuits are turned on', 120)
) AS task(description, "order")
  ON true
WHERE jt.name = 'New Construction';
