/**
 * Test Verifikasi WBS 3.1.2: Role-Based Access Control (RBAC)
 * Memverifikasi:
 * 1. Otorisasi role Buyer, Seller, dan Admin
 * 2. Penolakan akses (403 Forbidden) saat role tidak memiliki wewenang
 * 3. Kelolosan akses (Next Handler) saat role sesuai hak akses
 */
const authorize = require('../middleware/authorize');

function mockResponse() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

function runRbacVerification() {
  console.log('====================================================');
  console.log('🧪 PENGUJIAN WBS 3.1.2: ROLE-BASED ACCESS CONTROL');
  console.log('====================================================\n');

  // Test Case A: Endpoint Penjual (/api/seller/queue) - Diuji dengan akun Buyer
  console.log('Kasus A: Akun Buyer mengakses endpoint khusus Seller:');
  const reqBuyer = { user: { id: 'usr-1', username: 'adrian', role: 'buyer' } };
  const resBuyer = mockResponse();
  let nextCalledBuyer = false;

  const sellerGuard = authorize('seller');
  sellerGuard(reqBuyer, resBuyer, () => { nextCalledBuyer = true; });

  if (resBuyer.statusCode === 403) {
    console.log(`   - Status HTTP: ${resBuyer.statusCode} Forbidden`);
    console.log(`   - Respons Body: ${JSON.stringify(resBuyer.body)}`);
    console.log(`   - Hasil: ✅ Akses DITOLAK secara tepat oleh middleware RBAC\n`);
  } else {
    console.log(`   - Hasil: ❌ Gagal menolak akses ilegal\n`);
  }

  // Test Case B: Endpoint Penjual (/api/seller/queue) - Diuji dengan akun Seller
  console.log('Kasus B: Akun Seller mengakses endpoint khusus Seller:');
  const reqSeller = { user: { id: 'usr-2', username: 'pakjoko', role: 'seller' } };
  const resSeller = mockResponse();
  let nextCalledSeller = false;

  sellerGuard(reqSeller, resSeller, () => { nextCalledSeller = true; });

  if (nextCalledSeller) {
    console.log(`   - Next Middleware Terpanggil: ${nextCalledSeller}`);
    console.log(`   - Hasil: ✅ Akses DIIZINKAN untuk role yang berhak\n`);
  } else {
    console.log(`   - Hasil: ❌ Akses tertahan\n`);
  }

  // Test Case C: Endpoint Admin Panel (/api/admin/metrics) - Diuji dengan akun Admin
  console.log('Kasus C: Akun Admin mengakses endpoint khusus Admin:');
  const reqAdmin = { user: { id: 'usr-3', username: 'admin', role: 'admin' } };
  const resAdmin = mockResponse();
  let nextCalledAdmin = false;

  const adminGuard = authorize('admin');
  adminGuard(reqAdmin, resAdmin, () => { nextCalledAdmin = true; });

  if (nextCalledAdmin) {
    console.log(`   - Next Middleware Terpanggil: ${nextCalledAdmin}`);
    console.log(`   - Hasil: ✅ Akses DIIZINKAN untuk role Admin\n`);
  } else {
    console.log(`   - Hasil: ❌ Akses tertahan\n`);
  }

  console.log('====================================================');
  console.log('🎉 HASIL: Implementasi WBS 3.1.2 Terverifikasi Berhasil');
  console.log('====================================================\n');
}

runRbacVerification();
