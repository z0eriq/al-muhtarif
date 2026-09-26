import { revalidatePath } from "next/cache";

const STORE_PATHS = [
  "/",
  "/shop",
  "/contact",
  "/about",
  "/cart",
  "/checkout",
  "/wishlist",
] as const;

export function revalidateStorefront(extraPaths: string[] = []) {
  revalidatePath("/", "layout");
  for (const path of STORE_PATHS) {
    revalidatePath(path);
  }
  for (const path of extraPaths) {
    if (path) revalidatePath(path);
  }
}
