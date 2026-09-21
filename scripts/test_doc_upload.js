// Test script: end-to-end test for document upload & view
// 1. Create a tiny 1x1 PNG as base64 (data URL)
// 2. Submit pendaftaran with all 5 documents
// 3. Verify that the saved pendaftaran has the documents
// 4. Approve the pendaftaran via verifikasi API
// 5. Verify the new anggota has all documents copied

const BASE = "http://localhost:3000";

// Tiny 1x1 transparent PNG (~70 bytes)
const TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
// Tiny PDF (~70 bytes)
const TINY_PDF = "data:application/pdf;base64,JVBERi0xLjEKJcKlwrHDqMKPwoIPCjEgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDIgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZS9QYWdlcy9LaWRzWzMgMCBSXS9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlL01lZGlhQm94WzAgMCAzMDBdL1BhcmVudCAyIDAgUj4+CmVuZG9iagp4cmVmCjAgMDAwMDAwMDAwMAp0cmFpbGVyCjw8L1NpemUgNC9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjEKJSVFT0YK";

async function test() {
  console.log("\n=== STEP 1: Submit pendaftaran with 5 documents ===");
  // First get a valid provinsi & kabupaten
  const wilRes = await fetch(`${BASE}/api/wilayah?type=provinsi`);
  const wilJson = await wilRes.json();
  if (!wilJson.success || !wilJson.data.length) {
    console.error("Failed to fetch provinsi");
    return;
  }
  const prov = wilJson.data[0];
  console.log(`Using provinsi: ${prov.nama} (id=${prov.id})`);

  const kabRes = await fetch(`${BASE}/api/wilayah?type=kabupaten`);
  const kabJson = await kabRes.json();
  const kab = kabJson.data.find((k) => k.provinsiId === prov.id);
  if (!kab) {
    console.error("No kabupaten found for provinsi");
    return;
  }
  console.log(`Using kabupaten: ${kab.nama} (id=${kab.id})`);

  const pendaftaranBody = {
    namaLengkap: "Test Dokumen Upload",
    nik: "3201010101900001",
    tempatLahir: "Test Kota",
    tanggalLahir: "2000-01-01",
    jenisKelamin: "L",
    alamat: "Jl. Test No. 1",
    provinsiId: String(prov.id),
    kabupatenId: String(kab.id),
    email: "test.doc@example.com",
    hp: "081234567890",
    whatsapp: "081234567890",
    motivasi: "Test motivasi",
    persyaratan: [true, true, true, true, true, true],
    foto: TINY_PNG,
    ktp: TINY_PNG,
    cv: TINY_PDF,
    suratPernyataan: TINY_PDF,
    suratSehat: TINY_PDF,
  };

  const postRes = await fetch(`${BASE}/api/pendaftaran`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pendaftaranBody),
  });
  const postJson = await postRes.json();
  if (!postJson.success) {
    console.error("Failed to submit pendaftaran:", postJson.error);
    return;
  }
  const pendaftaranId = postJson.data.id;
  console.log(`✓ Pendaftaran created with id=${pendaftaranId}`);

  console.log("\n=== STEP 2: Verify pendaftaran has all 5 documents ===");
  const pendGet = await fetch(`${BASE}/api/pendaftaran`);
  const pendJson = await pendGet.json();
  const created = pendJson.data.find((p) => p.id === pendaftaranId);
  console.log(`  foto: ${created.foto ? "✓" : "✗"} (${created.foto ? created.foto.substring(0, 40) + "..." : "null"})`);
  console.log(`  ktp: ${created.ktp ? "✓" : "✗"}`);
  console.log(`  cv: ${created.cv ? "✓" : "✗"}`);
  console.log(`  suratPernyataan: ${created.suratPernyataan ? "✓" : "✗"}`);
  console.log(`  suratSehat: ${created.suratSehat ? "✓" : "✗"}`);

  console.log("\n=== STEP 3: Approve pendaftaran — should auto-create anggota with all docs ===");
  const approveRes = await fetch(`${BASE}/api/pendaftaran/${pendaftaranId}/verifikasi`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "DISETUJUI" }),
  });
  const approveJson = await approveRes.json();
  if (!approveJson.success) {
    console.error("Failed to approve pendaftaran:", approveJson.error);
    return;
  }
  console.log("✓ Pendaftaran approved, anggota should be created");

  console.log("\n=== STEP 4: Verify anggota created with all 5 documents ===");
  const anggotaRes = await fetch(`${BASE}/api/anggota?search=Test%20Dokumen`);
  const anggotaJson = await anggotaRes.json();
  const newAnggota = anggotaJson.data.find((a) => a.namaLengkap === "Test Dokumen Upload");
  if (!newAnggota) {
    console.error("New anggota not found");
    return;
  }
  console.log(`✓ Anggota created with NIA: ${newAnggota.nia}`);

  const detailRes = await fetch(`${BASE}/api/anggota/${newAnggota.id}/detail`);
  const detailJson = await detailRes.json();
  if (!detailJson.success) {
    console.error("Failed to fetch anggota detail");
    return;
  }
  const a = detailJson.data.anggota;
  console.log(`  foto: ${a.foto ? "✓" : "✗"}`);
  console.log(`  ktp: ${a.ktp ? "✓" : "✗"}`);
  console.log(`  cv: ${a.cv ? "✓" : "✗"}`);
  console.log(`  suratPernyataan: ${a.suratPernyataan ? "✓" : "✗"}`);
  console.log(`  suratSehat: ${a.suratSehat ? "✓" : "✗"}`);

  const allOk = a.foto && a.ktp && a.cv && a.suratPernyataan && a.suratSehat;
  console.log(`\n${allOk ? "✅ ALL DOCUMENTS UPLOADED & COPIED SUCCESSFULLY" : "❌ SOME DOCUMENTS MISSING"}`);

  console.log("\n=== STEP 5: Test admin Tambah Anggota with all 5 documents ===");
  const anggotaPostBody = {
    namaLengkap: "Test Admin Tambah Anggota",
    nik: "3201010102900002",
    tempatLahir: "Test Kota 2",
    tanggalLahir: "1999-05-15",
    jenisKelamin: "P",
    alamat: "Jl. Admin Test No. 2",
    provinsiId: String(prov.id),
    kabupatenId: String(kab.id),
    email: "test.admin@example.com",
    hp: "081298765432",
    pekerjaan: "Tester",
    foto: TINY_PNG,
    ktp: TINY_PNG,
    cv: TINY_PDF,
    suratPernyataan: TINY_PDF,
    suratSehat: TINY_PDF,
  };
  const anggotaPostRes = await fetch(`${BASE}/api/anggota`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(anggotaPostBody),
  });
  const anggotaPostJson = await anggotaPostRes.json();
  if (!anggotaPostJson.success) {
    console.error("Failed to create anggota via admin:", anggotaPostJson.error);
    return;
  }
  console.log(`✓ Anggota created via admin with NIA: ${anggotaPostJson.data.nia}`);

  const detail2Res = await fetch(`${BASE}/api/anggota/${anggotaPostJson.data.id}/detail`);
  const detail2Json = await detail2Res.json();
  const a2 = detail2Json.data.anggota;
  console.log(`  foto: ${a2.foto ? "✓" : "✗"}`);
  console.log(`  ktp: ${a2.ktp ? "✓" : "✗"}`);
  console.log(`  cv: ${a2.cv ? "✓" : "✗"}`);
  console.log(`  suratPernyataan: ${a2.suratPernyataan ? "✓" : "✗"}`);
  console.log(`  suratSehat: ${a2.suratSehat ? "✓" : "✗"}`);

  const allOk2 = a2.foto && a2.ktp && a2.cv && a2.suratPernyataan && a2.suratSehat;
  console.log(`\n${allOk2 ? "✅ ADMIN TAMBAH ANGGOTA: ALL DOCS SAVED" : "❌ ADMIN TAMBAH ANGGOTA: SOME DOCS MISSING"}`);

  console.log("\n=== DONE ===");
}

test().catch(console.error);
