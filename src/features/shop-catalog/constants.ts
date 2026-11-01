/** `a-z0-9-`, no leading/trailing `-`, no `--` (category + product handle) */
export const HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Field limits from BE notice §1.2 */
export const CATEGORY_LIMITS = {
  name: 255,
  handle: 80,
  description: 1000,
  imageUrl: 1000,
} as const;
