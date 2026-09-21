// ============================================================
// Helper untuk handle fetch response secara konsisten di frontend
// ============================================================

export async function fetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  let json: any;
  try {
    json = await res.json();
  } catch (e) {
    throw new Error(
      `Server merespons HTTP ${res.status} (body bukan JSON). Coba refresh halaman dan ulangi.`
    );
  }
  if (!json.success) {
    throw new Error(json.error || `Gagal menyimpan (HTTP ${res.status})`);
  }
  return json as T;
}

// Versi tanpa throw — return { ok, data, error }
export async function fetchJsonSafe<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string; status: number }> {
  try {
    const res = await fetch(url, options);
    let json: any;
    try {
      json = await res.json();
    } catch (e) {
      return {
        ok: false,
        error: `Server merespons HTTP ${res.status} (body bukan JSON). Coba refresh halaman dan ulangi.`,
        status: res.status,
      };
    }
    if (!json.success) {
      return {
        ok: false,
        error: json.error || `Gagal (HTTP ${res.status})`,
        status: res.status,
      };
    }
    return { ok: true, data: json as T, status: res.status };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error", status: 0 };
  }
}
