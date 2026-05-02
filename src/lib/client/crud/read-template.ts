import { db, powerSyncDb } from "$lib/client/db";
import { job_templates, type SelectJobTemplate } from "$lib/client/schema";

export async function listJobTemplates() {
  const templates: SelectJobTemplate[] = await db
    .select()
    .from(job_templates)
    .orderBy(job_templates.order, job_templates.name);

  return templates ?? [];
}

export function watchJobTemplates(
  onTemplates: (templates: SelectJobTemplate[]) => void,
  onError?: (error: unknown) => void,
) {
  const watched = powerSyncDb
    .query({
      sql: `select * from job_templates order by "order", name`,
      parameters: [],
    })
    .watch();
  const dispose = watched.registerListener({
    onData: (data) => onTemplates(data as SelectJobTemplate[]),
    onError: (error) => onError?.(error),
  });
  return dispose;
}
