#!/bin/bash
# End-to-end test untuk semua modul yang diperbaiki
# Test pendaftaran, wilayah, pengurus, jabatan, anggota

set -e
BASE="http://localhost:3000"
PASS=0
FAIL=0
declare -a ERRORS

check() {
  local name="$1"
  local expected_status="$2"
  local actual_status="$3"
  local body="$4"
  if [ "$actual_status" = "$expected_status" ] && echo "$body" | grep -q '"success":true'; then
    echo "✓ $name (HTTP $actual_status)"
    PASS=$((PASS + 1))
  else
    echo "✗ $name (HTTP $actual_status, expected $expected_status)"
    echo "  Response: $(echo $body | head -c 200)"
    FAIL=$((FAIL + 1))
    ERRORS+=("$name")
  fi
}

echo "============================================"
echo "E2E Test - KIPAN API"
echo "============================================"

# ========================================
# 1. PENDAFTARAN
# ========================================
echo ""
echo "[1/5] PENDAFTARAN"
# Test valid pendaftaran
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/pendaftaran" \
  -H "Content-Type: application/json" \
  -d '{
    "namaLengkap": "Test E2E Pendaftaran",
    "nik": "3204010101900001",
    "tempatLahir": "Bandung",
    "tanggalLahir": "2001-01-01",
    "jenisKelamin": "L",
    "alamat": "Jl. Test No. 1",
    "provinsiNama": "Jawa Barat",
    "kabupatenKode": "3204",
    "kecamatan": "Padalarang",
    "kodePos": "40553",
    "email": "e2e.test1@example.com",
    "hp": "081234567890",
    "persyaratan": [true,true,true,true,true,true]
  }')
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
check "POST /api/pendaftaran (valid)" "200" "$STATUS" "$BODY"

# Test pendaftaran dengan kabupaten baru (auto-create)
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/pendaftaran" \
  -H "Content-Type: application/json" \
  -d '{
    "namaLengkap": "Test E2E Garut",
    "nik": "3211010101900002",
    "tempatLahir": "Garut",
    "tanggalLahir": "2002-05-15",
    "jenisKelamin": "P",
    "alamat": "Jl. Garut",
    "provinsiNama": "Jawa Barat",
    "kabupatenKode": "3208",
    "email": "e2e.test2@example.com",
    "hp": "081234567891",
    "persyaratan": [true,true,true,true,true,true]
  }')
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
check "POST /api/pendaftaran (kabupaten baru)" "200" "$STATUS" "$BODY"

# Test pendaftaran dengan provinsi salah (nama tidak ada)
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/pendaftaran" \
  -H "Content-Type: application/json" \
  -d '{
    "namaLengkap": "Test Invalid Prov",
    "nik": "3204010101900003",
    "tempatLahir": "X",
    "tanggalLahir": "2001-01-01",
    "jenisKelamin": "L",
    "alamat": "X",
    "provinsiNama": "Provinsi Tidak Ada",
    "kabupatenKode": "3204",
    "email": "e2e.test3@example.com",
    "hp": "081234567892"
  }')
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
# Expect 400 with specific error
if [ "$STATUS" = "400" ] && echo "$BODY" | grep -q "Provinsi"; then
  echo "✓ POST /api/pendaftaran (invalid provinsi) - ditolak dengan pesan jelas"
  PASS=$((PASS + 1))
else
  echo "✗ POST /api/pendaftaran (invalid provinsi) - HTTP $STATUS"
  FAIL=$((FAIL + 1))
  ERRORS+=("pendaftaran invalid provinsi")
fi

# ========================================
# 2. WILAYAH
# ========================================
echo ""
echo "[2/5] WILAYAH"
RESP=$(curl -s -w "\n%{http_code}" "$BASE/api/wilayah")
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
check "GET /api/wilayah" "200" "$STATUS" "$BODY"

# Test POST kabupaten baru
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/wilayah" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "kabupaten",
    "kode": "3276",
    "nama": "Test Kabupaten E2E",
    "provinsiId": 2,
    "status": "Aktif"
  }')
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
check "POST /api/wilayah (kabupaten baru)" "200" "$STATUS" "$BODY"

# Cleanup test kabupaten
NEW_KAB_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
if [ -n "$NEW_KAB_ID" ]; then
  curl -s -X DELETE "$BASE/api/wilayah?type=kabupaten&id=$NEW_KAB_ID" > /dev/null
fi

# Test POST provinsi duplikat (kode sudah ada)
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/wilayah" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "provinsi",
    "kode": "JB",
    "nama": "Jawa Barat Duplicate",
    "status": "Aktif"
  }')
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
if [ "$STATUS" = "400" ] && echo "$BODY" | grep -q "sudah ada"; then
  echo "✓ POST /api/wilayah (duplikat) - ditolak dengan pesan jelas"
  PASS=$((PASS + 1))
else
  echo "✗ POST /api/wilayah (duplikat) - HTTP $STATUS"
  FAIL=$((FAIL + 1))
  ERRORS+=("wilayah duplikat")
fi

# ========================================
# 3. JABATAN
# ========================================
echo ""
echo "[3/5] JABATAN"
RESP=$(curl -s -w "\n%{http_code}" "$BASE/api/jabatan")
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
check "GET /api/jabatan" "200" "$STATUS" "$BODY"

# Test POST jabatan baru (gunakan nama unik dengan timestamp)
UNIQ_JAB="Test Jabatan E2E $(date +%s)"
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/jabatan" \
  -H "Content-Type: application/json" \
  -d "{
    \"nama\": \"$UNIQ_JAB\",
    \"bidang\": \"Bidang Test E2E Unique\",
    \"level\": \"Nasional\"
  }")
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
check "POST /api/jabatan (jabatan baru)" "200" "$STATUS" "$BODY"

# Test bulk create bidang
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/jabatan/bulk-create-bidang" \
  -H "Content-Type: application/json" \
  -d '{
    "bidang": "Bidang Bulk E2E",
    "levels": ["Nasional", "Provinsi", "Kabupaten"]
  }')
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
check "POST /api/jabatan/bulk-create-bidang" "200" "$STATUS" "$BODY"

# ========================================
# 4. PENGURUS
# ========================================
echo ""
echo "[4/5] PENGURUS"
RESP=$(curl -s -w "\n%{http_code}" "$BASE/api/pengurus")
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
check "GET /api/pengurus" "200" "$STATUS" "$BODY"

# Get a jabatan ID for testing
JABATAN_ID=$(curl -s "$BASE/api/jabatan" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Using jabatanId: $JABATAN_ID"

# Test POST pengurus mode manual (orang baru) — sertakan provinsi/kabupaten domisili
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/pengurus" \
  -H "Content-Type: application/json" \
  -d "{
    \"isNewAnggota\": true,
    \"newAnggotaData\": {
      \"namaLengkap\": \"E2E Test Pengurus\",
      \"tempatLahir\": \"Bandung\",
      \"tanggalLahir\": \"1995-05-10\",
      \"jenisKelamin\": \"L\",
      \"alamat\": \"Jl. Test\",
      \"email\": \"e2e.pengurus@example.com\",
      \"hp\": \"081234567893\"
    },
    \"jabatanId\": $JABATAN_ID,
    \"level\": \"NASIONAL\",
    \"provinsiId\": 2,
    \"kabupatenId\": 4,
    \"status\": \"Aktif\",
    \"tanggalMulai\": \"2026-07-27\"
  }")
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
check "POST /api/pengurus (mode manual)" "200" "$STATUS" "$BODY"

# Save pengurus ID for later cleanup
PENGURUS_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
ANGGOTA_ID=$(echo "$BODY" | grep -o '"anggotaId":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Created pengurus ID: $PENGURUS_ID, anggota ID: $ANGGOTA_ID"

# Test POST pengurus dengan jabatanId kosong (harus gagal)
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/pengurus" \
  -H "Content-Type: application/json" \
  -d '{
    "jabatanId": "",
    "anggotaId": "1",
    "level": "NASIONAL"
  }')
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
if [ "$STATUS" = "400" ] && echo "$BODY" | grep -q "Jabatan"; then
  echo "✓ POST /api/pengurus (jabatan kosong) - ditolak dengan pesan jelas"
  PASS=$((PASS + 1))
else
  echo "✗ POST /api/pengurus (jabatan kosong) - HTTP $STATUS"
  FAIL=$((FAIL + 1))
  ERRORS+=("pengurus jabatan kosong")
fi

# Test POST pengurus dengan jabatanId tidak valid (NaN)
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/pengurus" \
  -H "Content-Type: application/json" \
  -d '{
    "jabatanId": "abc",
    "anggotaId": "1",
    "level": "NASIONAL"
  }')
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
if [ "$STATUS" = "400" ] && echo "$BODY" | grep -q "Jabatan"; then
  echo "✓ POST /api/pengurus (jabatanId NaN) - ditolak dengan pesan jelas"
  PASS=$((PASS + 1))
else
  echo "✗ POST /api/pengurus (jabatanId NaN) - HTTP $STATUS"
  FAIL=$((FAIL + 1))
  ERRORS+=("pengurus jabatanId NaN")
fi

# ========================================
# 5. ANGGOTA
# ========================================
echo ""
echo "[5/5] ANGGOTA"
RESP=$(curl -s -w "\n%{http_code}" "$BASE/api/anggota")
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
check "GET /api/anggota" "200" "$STATUS" "$BODY"

# Test POST anggota valid
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/anggota" \
  -H "Content-Type: application/json" \
  -d '{
    "namaLengkap": "E2E Test Anggota",
    "nik": "3204010101900099",
    "tempatLahir": "Bandung",
    "tanggalLahir": "2000-01-01",
    "jenisKelamin": "L",
    "alamat": "Jl. Test",
    "provinsiId": 2,
    "kabupatenId": 4,
    "email": "e2e.anggota@example.com",
    "hp": "081234567894"
  }')
STATUS=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
check "POST /api/anggota (valid)" "200" "$STATUS" "$BODY"

# ========================================
# SUMMARY
# ========================================
echo ""
echo "============================================"
echo "SUMMARY: $PASS passed, $FAIL failed"
echo "============================================"
if [ $FAIL -gt 0 ]; then
  echo "FAILED TESTS:"
  for e in "${ERRORS[@]}"; do
    echo "  - $e"
  done
fi
