INSERT INTO job_materials (job_id, material_id, quantity)
SELECT
  'JOB_ID_HERE'::uuid AS job_id,
  m.id AS material_id,
  0 AS quantity
FROM materials m;
