import { db } from "$lib/client/db";
import { categories, type SelectCategory } from "$lib/client/schema";

export async function listCategories() {
  const categoryList: SelectCategory[] = await db
    .select()
    .from(categories)
    .orderBy(categories.order);

  return categoryList || [];
}
