const PALETTE_SIZE = 8;

/**
 * Returns a deterministic CSS class (wl-color-0 … wl-color-7) for any workload
 * name, based on a simple string hash. The same name always gets the same class
 * and no workload names are hardcoded anywhere.
 */
export function workloadColorClass(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return `wl-color-${h % PALETTE_SIZE}`;
}
