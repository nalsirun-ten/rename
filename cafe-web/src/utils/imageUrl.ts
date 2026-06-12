const SUPABASE_URL = 'https://keqrpgrbfifojjpgdjca.supabase.co';

/**
 * Transforms an image URL to a low-res thumbnail for grid/card views.
 * Reduces bandwidth ~10-30x compared to full-size originals.
 *
 * - Unsplash → sets their optimization params (replacing any existing
 *   w/h/q values — appending duplicates produced broken-looking URLs)
 * - Supabase Storage → returned as-is: transform query params only work on
 *   the /render/image/ endpoint (paid plan), appending them to
 *   /object/public/ URLs does nothing
 * - Other URLs → returned as-is
 */
export function thumbnailUrl(url: string, size = 400): string {
  if (!url) return url;

  if (url.includes('unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', String(size));
      u.searchParams.set('h', String(size));
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('auto', 'format');
      u.searchParams.set('q', '75');
      return u.toString();
    } catch {
      return url;
    }
  }

  // Supabase storage: no client-side resizing available — keep the URL clean
  if (url.startsWith(SUPABASE_URL)) return url;

  return url;
}
