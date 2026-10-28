// ============================================================
// KantinKu - Prototype API Layer & Mock Backend Engine
// ============================================================

// ── Default Dummy Data Seeds ───────────────────────────────
const INITIAL_MOCK_DB = {
  users: [
    {
      id: 'usr-1',
      username: 'adrian',
      full_name: 'Adrian Pratama',
      email: 'adrian@kantinku.id',
      phone_number: '081234567890',
      role: 'buyer',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-2',
      username: 'pakjoko',
      full_name: 'Pak Joko Widodo',
      email: 'pakjoko@kantinku.id',
      phone_number: '081298765432',
      role: 'seller',
      stall_id: 'stl-1',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'usr-3',
      username: 'admin',
      full_name: 'Admin Utama',
      email: 'admin@kantinku.id',
      phone_number: '081211112222',
      role: 'admin',
      avatar_url: ''
    },
    {
      id: 'usr-4',
      username: 'busri',
      full_name: 'Bu Sri Wahyuni',
      email: 'busri@kantinku.id',
      phone_number: '081333444555',
      role: 'seller',
      stall_id: 'stl-2',
      avatar_url: ''
    },
    {
      id: 'usr-5',
      username: 'cakhar',
      full_name: 'Cak Har Hartono',
      email: 'cakhar@kantinku.id',
      phone_number: '081555666777',
      role: 'seller',
      stall_id: 'stl-3',
      avatar_url: ''
    }
  ],

  umkm: [
    {
      id: 'umkm-1',
      name: 'Kantin Pusat Universitas Indonesia',
      description: 'Pusat kuliner mahasiswa dan dosen UI dengan beragam pilihan makanan nusantara.',
      city_region: 'Depok / Jakarta',
      full_address: 'Kantin Pusat UI, Pondok Cina, Beji, Kota Depok, Jawa Barat 16424',
      photo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
      is_active: true
    },
    {
      id: 'umkm-2',
      name: 'Food Court ITB Ganesha',
      description: 'Kantin modern kampus ITB Bandung dengan aneka kuliner khas Sunda dan kekinian.',
      city_region: 'Bandung',
      full_address: 'Jl. Ganesha No. 10, Lebak Siliwangi, Kecamatan Coblong, Kota Bandung',
      photo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
      is_active: true
    },
    {
      id: 'umkm-3',
      name: 'Pusat Jajanan Lembah UGM',
      description: 'Kantin legendaris di lingkungan UGM dengan harga terjangkau bagi civitas akademika.',
      city_region: 'Yogyakarta',
      full_address: 'Kawasan Lembah UGM, Caturtunggal, Depok, Kabupaten Sleman, D.I. Yogyakarta',
      photo_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800',
      is_active: true
    },
    {
      id: 'umkm-4',
      name: 'Food Court Asrama ITS',
      description: 'Kantin mahasiswa kampus ITS Surabaya yang menyajikan hidangan lezat dan cepat saji.',
      city_region: 'Surabaya',
      full_address: 'Jl. Raya ITS, Sukolilo, Surabaya, Jawa Timur 60111',
      photo_url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800',
      is_active: true
    }
  ],

  stalls: [
    {
      id: 'stl-1',
      umkm_location_id: 'umkm-1',
      name: 'Warung Nasi Goreng Pak Joko',
      description: 'Aneka nasi goreng dan mie goreng jawa dengan bumbu rempah otentik pilihan.',
      photo_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600',
      is_open: true,
      rating_avg: 4.8,
      rating_count: 124,
      whatsapp: '081298765432',
      owner_id: 'usr-2'
    },
    {
      id: 'stl-2',
      umkm_location_id: 'umkm-1',
      name: 'Ayam Geprek Bu Sri Crispy',
      description: 'Ayam geprek krispi dengan pilihan sambal bawang, matah, dan mozarella pedas mantap.',
      photo_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600',
      is_open: true,
      rating_avg: 4.6,
      rating_count: 89,
      whatsapp: '081333444555',
      owner_id: 'usr-4'
    },
    {
      id: 'stl-3',
      umkm_location_id: 'umkm-1',
      name: 'Soto Lamongan Asli Cak Har',
      description: 'Soto ayam kuah kuning gurih dengan taburan koya istimewa dan sambal rawit.',
      photo_url: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&q=80&w=600',
      is_open: true,
      rating_avg: 4.7,
      rating_count: 95,
      whatsapp: '081555666777',
      owner_id: 'usr-5'
    },
    {
      id: 'stl-4',
      umkm_location_id: 'umkm-2',
      name: 'Kopi & Roti Bakar Ganesha',
      description: 'Kopi susu gula aren, toast bakar butter, dan camilan santai kampus.',
      photo_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600',
      is_open: true,
      rating_avg: 4.9,
      rating_count: 67,
      whatsapp: '081244556677',
      owner_id: 'usr-2'
    }
  ],

  menus: [
    // Warung Pak Joko
    {
      id: 'mnu-1',
      stall_id: 'stl-1',
      name: 'Nasi Goreng Spesial Pak Joko',
      description: 'Nasi goreng dengan suwiran ayam, bakso, sosis, dan telur mata sapi setengah matang.',
      price: 18000,
      photo_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=400',
      is_available: true
    },
    {
      id: 'mnu-2',
      stall_id: 'stl-1',
      name: 'Nasi Goreng Seafood Pedas',
      description: 'Nasi goreng udang dan cumi segar dipadu cabai rawit pedas nagih.',
      price: 25000,
      photo_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400',
      is_available: true
    },
    {
      id: 'mnu-3',
      stall_id: 'stl-1',
      name: 'Mie Goreng Jawa Klaten',
      description: 'Mie telur kuning dimasak dengan sayuran segar, telur orak arik, dan acar timun.',
      price: 16000,
      photo_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400',
      is_available: true
    },
    {
      id: 'mnu-4',
      stall_id: 'stl-1',
      name: 'Es Teh Manis Melati',
      description: 'Seduhan teh melati wangi dengan es batu segar dingin melegakan dahaga.',
      price: 5000,
      photo_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400',
      is_available: true
    },

    // Ayam Geprek Bu Sri
    {
      id: 'mnu-5',
      stall_id: 'stl-2',
      name: 'Paket Ayam Geprek Original + Nasi',
      description: 'Ayam krispi digeprek sambal bawang pedas level 1-5 lengkap dengan nasi hangat.',
      price: 18000,
      photo_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=400',
      is_available: true
    },
    {
      id: 'mnu-6',
      stall_id: 'stl-2',
      name: 'Ayam Geprek Mozarella Leleh',
      description: 'Ayam geprek dengan lelehan keju mozarella tebal yang dibakar aromatik.',
      price: 24000,
      photo_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400',
      is_available: true
    },
    {
      id: 'mnu-7',
      stall_id: 'stl-2',
      name: 'Es Jeruk Peras Murni',
      description: 'Jeruk peras manis alami segar kaya vitamin C.',
      price: 6000,
      photo_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=400',
      is_available: true
    },

    // Soto Lamongan Cak Har
    {
      id: 'mnu-8',
      stall_id: 'stl-3',
      name: 'Soto Ayam Lamongan Komplit',
      description: 'Soto ayam suwir, soun, tauge, telur rebus, dan taburan koya gurih melimpah.',
      price: 20000,
      photo_url: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&q=80&w=400',
      is_available: true
    },
    {
      id: 'mnu-9',
      stall_id: 'stl-3',
      name: 'Nasi Putih Pulen',
      description: 'Porsi nasi putih hangat wangi.',
      price: 5000,
      photo_url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&q=80&w=400',
      is_available: true
    }
  ],

  orders: [
    {
      id: 'ord-101',
      buyer_id: 'usr-1',
      dining_option: 'dine_in',
      total_amount: 41000,
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      splits: [
        {
          id: 'spt-101',
          order_id: 'ord-101',
          stall_id: 'stl-1',
          stall_name: 'Warung Nasi Goreng Pak Joko',
          stall_photo: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=200',
          stall_whatsapp: '081298765432',
          queue_number: 'A047',
          pickup_code: '472189',
          status: 'preparing', // Antrean, Dimasak, Siap, Selesai
          dining_option: 'dine_in',
          total_amount: 41000,
          buyer_name: 'Adrian Pratama',
          buyer_phone: '081234567890',
          is_rated: 0,
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          items: [
            {
              menu_item_id: 'mnu-1',
              menu_name: 'Nasi Goreng Spesial Pak Joko',
              menu_name_snapshot: 'Nasi Goreng Spesial Pak Joko',
              price: 18000,
              price_snapshot: 18000,
              quantity: 2,
              notes: 'Satu tidak pakai cabai, satu pedas sedang'
            },
            {
              menu_item_id: 'mnu-4',
              menu_name: 'Es Teh Manis Melati',
              menu_name_snapshot: 'Es Teh Manis Melati',
              price: 5000,
              price_snapshot: 5000,
              quantity: 1,
              notes: 'Manis sedang'
            }
          ]
        }
      ]
    },
    {
      id: 'ord-102',
      buyer_id: 'usr-1',
      dining_option: 'takeaway',
      total_amount: 24000,
      created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      splits: [
        {
          id: 'spt-102',
          order_id: 'ord-102',
          stall_id: 'stl-2',
          stall_name: 'Ayam Geprek Bu Sri Crispy',
          stall_photo: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=200',
          stall_whatsapp: '081333444555',
          queue_number: 'B012',
          pickup_code: '128945',
          status: 'pending',
          dining_option: 'takeaway',
          total_amount: 24000,
          buyer_name: 'Adrian Pratama',
          buyer_phone: '081234567890',
          is_rated: 0,
          created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
          items: [
            {
              menu_item_id: 'mnu-5',
              menu_name: 'Paket Ayam Geprek Original + Nasi',
              menu_name_snapshot: 'Paket Ayam Geprek Original + Nasi',
              price: 18000,
              price_snapshot: 18000,
              quantity: 1,
              notes: 'Level 3 pedas mantap'
            },
            {
              menu_item_id: 'mnu-7',
              menu_name: 'Es Jeruk Peras Murni',
              menu_name_snapshot: 'Es Jeruk Peras Murni',
              price: 6000,
              price_snapshot: 6000,
              quantity: 1,
              notes: ''
            }
          ]
        }
      ]
    },
    {
      id: 'ord-100',
      buyer_id: 'usr-1',
      dining_option: 'dine_in',
      total_amount: 25000,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      splits: [
        {
          id: 'spt-100',
          order_id: 'ord-100',
          stall_id: 'stl-3',
          stall_name: 'Soto Lamongan Asli Cak Har',
          stall_photo: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&q=80&w=200',
          stall_whatsapp: '081555666777',
          queue_number: 'C005',
          pickup_code: '059341',
          status: 'completed',
          dining_option: 'dine_in',
          total_amount: 25000,
          buyer_name: 'Adrian Pratama',
          buyer_phone: '081234567890',
          is_rated: 0,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              menu_item_id: 'mnu-8',
              menu_name: 'Soto Ayam Lamongan Komplit',
              menu_name_snapshot: 'Soto Ayam Lamongan Komplit',
              price: 20000,
              price_snapshot: 20000,
              quantity: 1,
              notes: 'Koya banyakin'
            },
            {
              menu_item_id: 'mnu-9',
              menu_name: 'Nasi Putih Pulen',
              menu_name_snapshot: 'Nasi Putih Pulen',
              price: 5000,
              price_snapshot: 5000,
              quantity: 1,
              notes: ''
            }
          ]
        }
      ]
    }
  ],

  reviews: [
    {
      id: 'rev-1',
      stall_id: 'stl-1',
      user_name: 'Dimas Aditya',
      rating: 5,
      comment: 'Nasi gorengnya enak banget! Porsinya pas dan telurnya setengah matang sempurna.',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'rev-2',
      stall_id: 'stl-1',
      user_name: 'Anonim',
      rating: 5,
      comment: 'Cepat diambil tanpa antre, pas jam istirahat kuliah gak buang waktu.',
      created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    },
    {
      id: 'rev-3',
      stall_id: 'stl-2',
      user_name: 'Rina S.',
      rating: 4,
      comment: 'Sambal bawangnya nendang pedasnya, mantap!',
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    }
  ],

  applications_umkm: [
    {
      id: 'app-u1',
      user_id: 'usr-1',
      name: 'Kantin Fakultas Teknik Undip',
      city_region: 'Semarang',
      full_address: 'Gedung FT Undip, Jl. Prof. Soedarto, Tembalang',
      description: 'Pusat jajanan teknik dengan 8 stan makanan siap saji.',
      contact_person: 'Adrian Pratama',
      contact_phone: '081234567890',
      status: 'pending',
      created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      sellers: [{ name: 'Bu Siti', phone: '0811223344' }, { name: 'Pak Bambang', phone: '0811223355' }]
    },
    {
      id: 'app-u2',
      user_id: 'usr-1',
      name: 'Kantin Baru Depok Square',
      city_region: 'Depok',
      full_address: 'Jl. Margonda Raya No. 45, Depok',
      description: 'Food court terpadu dekat stasiun UI.',
      contact_person: 'Adrian Pratama',
      contact_phone: '081234567890',
      status: 'approved',
      created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    }
  ],

  applications_stall: [
    {
      id: 'app-s1',
      user_id: 'usr-1',
      umkm_location_id: 'umkm-1',
      umkm_name: 'Kantin Pusat UI',
      stall_name: 'Kedai Es Pisang Ijo Daeng',
      description: 'Makanan penutup khas Makassar dan aneka es nusantara.',
      owner_name: 'Adrian Pratama',
      owner_phone: '081234567890',
      status: 'pending',
      created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString()
    }
  ]
};

// ── Database Manager ───────────────────────────────────────
const DB_KEY = 'kantinku_prototype_db_v1';

function getMockDb() {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_MOCK_DB));
    return JSON.parse(JSON.stringify(INITIAL_MOCK_DB));
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_MOCK_DB));
    return JSON.parse(JSON.stringify(INITIAL_MOCK_DB));
  }
}

function saveMockDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function resetMockDb() {
  localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_MOCK_DB));
  showToast('Database prototype berhasil di-reset!', 'success');
  setTimeout(() => window.location.reload(), 600);
}

// ── Auto Login for Seamless Demo Experience ────────────────
(function autoSeedAuth() {
  const currentToken = localStorage.getItem('kantinku_token');
  const currentUser = localStorage.getItem('kantinku_user');
  const path = window.location.pathname.toLowerCase();

  // If visiting seller page, ensure logged in as seller
  if (path.includes('seller') && (!currentUser || !currentUser.includes('"seller"'))) {
    const db = getMockDb();
    const seller = db.users.find(u => u.role === 'seller');
    if (seller) {
      saveAuth('mock-token-seller', seller);
    }
    return;
  }

  // If visiting admin page, ensure logged in as admin
  if (path.includes('admin') && (!currentUser || !currentUser.includes('"admin"'))) {
    const db = getMockDb();
    const admin = db.users.find(u => u.role === 'admin');
    if (admin) {
      saveAuth('mock-token-admin', admin);
    }
    return;
  }

  // If on login or register, do not force auto-login
  if (path.includes('login') || path.includes('register')) {
    return;
  }

  // Default to buyer for customer pages if no token
  if (!currentToken || !currentUser) {
    const db = getMockDb();
    const buyer = db.users.find(u => u.role === 'buyer');
    if (buyer) {
      saveAuth('mock-token-buyer', buyer);
    }
  }
})();

// ── Fetch Wrapper (Mock Backend API Handler) ────────────────
async function fetchApi(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const db = getMockDb();
  const urlObj = new URL(endpoint.startsWith('http') ? endpoint : `http://localhost${endpoint}`);
  const pathname = urlObj.pathname.replace(/^\/api/, '');
  const searchParams = urlObj.searchParams;

  let bodyData = {};
  if (options.body) {
    if (options.body instanceof FormData) {
      bodyData = {};
      for (const [k, v] of options.body.entries()) {
        bodyData[k] = v;
      }
    } else if (typeof options.body === 'string') {
      try { bodyData = JSON.parse(options.body); } catch (e) { bodyData = {}; }
    } else {
      bodyData = options.body;
    }
  }

  // Small async delay for realistic feel
  await new Promise(r => setTimeout(r, 60));

  // 1. AUTH ROUTES
  if (pathname === '/auth/login' && method === 'POST') {
    const username = (bodyData.username || '').toLowerCase();
    let user = db.users.find(u => u.username.toLowerCase() === username);

    // Dynamic role mapping if user enters custom username
    if (!user) {
      const role = username.includes('admin') ? 'admin' : (username.includes('seller') || username.includes('joko')) ? 'seller' : 'buyer';
      user = {
        id: 'usr-' + Date.now(),
        username: bodyData.username || 'user',
        full_name: (bodyData.username || 'User').toUpperCase(),
        email: `${bodyData.username || 'user'}@kantinku.id`,
        role: role,
        phone_number: '081234567890'
      };
      db.users.push(user);
      saveMockDb(db);
    }

    return {
      status: 'success',
      data: {
        token: `mock-token-${user.role}-${Date.now()}`,
        user: user
      }
    };
  }

  if (pathname === '/auth/register' && method === 'POST') {
    const newUser = {
      id: 'usr-' + Date.now(),
      username: bodyData.username,
      full_name: bodyData.full_name || bodyData.username,
      email: bodyData.email,
      phone_number: bodyData.phone_number || '',
      role: 'buyer'
    };
    db.users.push(newUser);
    saveMockDb(db);
    return { status: 'success', message: 'Registrasi berhasil', data: { user: newUser } };
  }

  if (pathname === '/auth/me') {
    const current = getUser() || db.users[0];
    if (method === 'PATCH') {
      if (bodyData.full_name) current.full_name = bodyData.full_name;
      if (bodyData.phone_number) current.phone_number = bodyData.phone_number;
      saveAuth(getToken(), current);
      // update in DB
      const idx = db.users.findIndex(u => u.id === current.id);
      if (idx !== -1) { db.users[idx] = current; saveMockDb(db); }
      return { status: 'success', data: current };
    }
    return { status: 'success', data: current };
  }

  if (pathname === '/auth/me/password') {
    return { status: 'success', message: 'Password berhasil diubah' };
  }

  // 2. UMKM ROUTES
  if (pathname === '/umkm' && method === 'GET') {
    let list = db.umkm.filter(u => u.is_active !== false);
    const search = searchParams.get('search')?.toLowerCase();
    const city = searchParams.get('city')?.toLowerCase();
    if (search) {
      list = list.filter(u => u.name.toLowerCase().includes(search) || u.description?.toLowerCase().includes(search));
    }
    if (city) {
      list = list.filter(u => u.city_region?.toLowerCase().includes(city));
    }
    return { status: 'success', data: list };
  }

  const umkmMatch = pathname.match(/^\/umkm\/([^\/]+)$/);
  if (umkmMatch && method === 'GET') {
    const umkmId = umkmMatch[1];
    const umkm = db.umkm.find(u => u.id === umkmId) || db.umkm[0];
    const stalls = db.stalls.filter(s => s.umkm_location_id === umkm.id);
    return { status: 'success', data: { ...umkm, stalls } };
  }

  // 3. STALLS ROUTES
  const stallsByUmkm = pathname.match(/^\/stalls\/umkm\/([^\/]+)$/);
  if (stallsByUmkm && method === 'GET') {
    const umkmId = stallsByUmkm[1];
    const stalls = db.stalls.filter(s => s.umkm_location_id === umkmId);
    return { status: 'success', data: stalls };
  }

  const stallMatch = pathname.match(/^\/stalls\/([^\/]+)$/);
  if (stallMatch && method === 'GET') {
    const stallId = stallMatch[1];
    const stall = db.stalls.find(s => s.id === stallId) || db.stalls[0];
    return { status: 'success', data: stall };
  }

  const stallMenuMatch = pathname.match(/^\/stalls\/([^\/]+)\/menu$/);
  if (stallMenuMatch && method === 'GET') {
    const stallId = stallMenuMatch[1];
    const menus = db.menus.filter(m => m.stall_id === stallId);
    return { status: 'success', data: menus };
  }

  const stallReviewsMatch = pathname.match(/^\/stalls\/([^\/]+)\/reviews$/);
  if (stallReviewsMatch && method === 'GET') {
    const stallId = stallReviewsMatch[1];
    const reviews = db.reviews.filter(r => r.stall_id === stallId);
    return { status: 'success', data: reviews };
  }

  // 4. ORDERS ROUTES
  if (pathname === '/orders') {
    if (method === 'POST') {
      const user = getUser() || db.users[0];
      const items = bodyData.items || [];
      const diningOption = bodyData.dining_option || 'dine_in';
      const orderId = 'ord-' + Date.now();

      // Group items by stall
      const stallGroups = {};
      items.forEach(it => {
        if (!stallGroups[it.stall_id]) stallGroups[it.stall_id] = [];
        stallGroups[it.stall_id].push(it);
      });

      const splits = [];
      let grandTotal = 0;

      Object.keys(stallGroups).forEach((stallId, idx) => {
        const stall = db.stalls.find(s => s.id === stallId) || { name: 'Warung Kantin', whatsapp: '081298765432' };
        const splitItems = [];
        let splitTotal = 0;

        stallGroups[stallId].forEach(it => {
          const m = db.menus.find(menu => menu.id === it.menu_item_id) || { name: 'Item', price: 15000 };
          const itemTotal = m.price * (it.quantity || 1);
          splitTotal += itemTotal;
          splitItems.push({
            menu_item_id: it.menu_item_id,
            menu_name: m.name,
            menu_name_snapshot: m.name,
            price: m.price,
            price_snapshot: m.price,
            quantity: it.quantity || 1,
            notes: it.notes || ''
          });
        });

        grandTotal += splitTotal;
        const qPrefix = String.fromCharCode(65 + (db.orders.length % 26));
        const qNum = `${qPrefix}${String(Math.floor(Math.random() * 80) + 10).padStart(3, '0')}`;
        const pickupCode = String(Math.floor(100000 + Math.random() * 900000));

        splits.push({
          id: 'spt-' + Date.now() + '-' + idx,
          order_id: orderId,
          stall_id: stallId,
          stall_name: stall.name,
          stall_photo: stall.photo_url || '',
          stall_whatsapp: stall.whatsapp || '',
          queue_number: qNum,
          pickup_code: pickupCode,
          status: 'pending',
          dining_option: diningOption,
          total_amount: splitTotal,
          buyer_name: user.full_name || user.username,
          buyer_phone: user.phone_number || '',
          is_rated: 0,
          created_at: new Date().toISOString(),
          items: splitItems
        });
      });

      const newOrder = {
        id: orderId,
        buyer_id: user.id,
        dining_option: diningOption,
        total_amount: grandTotal,
        created_at: new Date().toISOString(),
        splits: splits
      };

      db.orders.unshift(newOrder);
      saveMockDb(db);

      return { status: 'success', data: { orderId: orderId, order: newOrder } };
    }

    if (method === 'GET') {
      const user = getUser() || db.users[0];
      return { status: 'success', data: db.orders };
    }
  }

  const orderDetailMatch = pathname.match(/^\/orders\/([^\/]+)$/);
  if (orderDetailMatch && method === 'GET') {
    const orderId = orderDetailMatch[1];
    const ord = db.orders.find(o => o.id === orderId) || db.orders[0];
    return { status: 'success', data: ord };
  }

  const splitDetailMatch = pathname.match(/^\/orders\/splits\/([^\/]+)\/details$/);
  if (splitDetailMatch && method === 'GET') {
    const splitId = splitDetailMatch[1];
    let foundSplit = null;
    for (const o of db.orders) {
      if (o.splits) {
        const s = o.splits.find(sp => sp.id === splitId);
        if (s) { foundSplit = s; break; }
      }
    }
    return { status: 'success', data: foundSplit || db.orders[0].splits[0] };
  }

  // 5. RATINGS ROUTE
  if (pathname === '/ratings' && method === 'POST') {
    const user = getUser() || db.users[0];
    const newReview = {
      id: 'rev-' + Date.now(),
      stall_id: bodyData.stall_id,
      user_name: bodyData.is_anonymous ? 'Anonim' : (user.full_name || user.username),
      rating: parseInt(bodyData.rating) || 5,
      comment: bodyData.comment || 'Makanannya mantap!',
      created_at: new Date().toISOString()
    };
    db.reviews.push(newReview);

    // mark split as rated
    if (bodyData.split_id) {
      db.orders.forEach(o => {
        if (o.splits) {
          const s = o.splits.find(sp => sp.id === bodyData.split_id);
          if (s) s.is_rated = 1;
        }
      });
    }

    saveMockDb(db);
    return { status: 'success', message: 'Rating berhasil dikirim' };
  }

  // 6. APPLICATIONS
  if (pathname === '/applications/umkm') {
    if (method === 'POST') {
      const user = getUser() || db.users[0];
      const newApp = {
        id: 'app-u-' + Date.now(),
        user_id: user.id,
        name: bodyData.name,
        city_region: bodyData.city_region,
        full_address: bodyData.full_address,
        description: bodyData.description,
        contact_person: user.full_name,
        contact_phone: user.phone_number,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      db.applications_umkm.unshift(newApp);
      saveMockDb(db);
      return { status: 'success', message: 'Pengajuan UMKM berhasil dikirim' };
    }
  }

  if (pathname === '/applications/stall') {
    if (method === 'POST') {
      const user = getUser() || db.users[0];
      const targetUmkm = db.umkm.find(u => u.id === bodyData.umkm_location_id) || db.umkm[0];
      const newApp = {
        id: 'app-s-' + Date.now(),
        user_id: user.id,
        umkm_location_id: targetUmkm.id,
        umkm_name: targetUmkm.name,
        stall_name: bodyData.stall_name,
        description: bodyData.description,
        owner_name: user.full_name,
        owner_phone: user.phone_number,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      db.applications_stall.unshift(newApp);
      saveMockDb(db);
      return { status: 'success', message: 'Pengajuan Warung berhasil dikirim' };
    }
  }

  if (pathname === '/applications/umkm/my') {
    return { status: 'success', data: db.applications_umkm };
  }

  if (pathname === '/applications/stall/my') {
    return { status: 'success', data: db.applications_stall };
  }

  // 7. SELLER ROUTES
  if (pathname === '/seller/stall/my/profile') {
    const stall = db.stalls[0]; // Pak Joko
    if (method === 'PATCH') {
      if (bodyData.name) stall.name = bodyData.name;
      if (bodyData.description) stall.description = bodyData.description;
      if (bodyData.whatsapp) stall.whatsapp = bodyData.whatsapp;
      saveMockDb(db);
    }
    return { status: 'success', data: stall };
  }

  if (pathname === '/seller/stall/my/status') {
    const stall = db.stalls[0];
    stall.is_open = bodyData.is_open !== undefined ? bodyData.is_open : !stall.is_open;
    saveMockDb(db);
    return { status: 'success', data: stall };
  }

  if (pathname === '/seller/menu') {
    const stall = db.stalls[0];
    if (method === 'GET') {
      const list = db.menus.filter(m => m.stall_id === stall.id);
      return { status: 'success', data: list };
    }
    if (method === 'POST') {
      const newM = {
        id: 'mnu-' + Date.now(),
        stall_id: stall.id,
        name: bodyData.name,
        price: parseFloat(bodyData.price) || 15000,
        description: bodyData.description || '',
        photo_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
        is_available: true
      };
      db.menus.push(newM);
      saveMockDb(db);
      return { status: 'success', data: newM };
    }
  }

  const sellerMenuEdit = pathname.match(/^\/seller\/menu\/([^\/]+)$/);
  if (sellerMenuEdit) {
    const mId = sellerMenuEdit[1];
    const m = db.menus.find(item => item.id === mId);
    if (method === 'PATCH' && m) {
      if (bodyData.name) m.name = bodyData.name;
      if (bodyData.price) m.price = parseFloat(bodyData.price);
      if (bodyData.description !== undefined) m.description = bodyData.description;
      saveMockDb(db);
      return { status: 'success', data: m };
    }
    if (method === 'DELETE') {
      db.menus = db.menus.filter(item => item.id !== mId);
      saveMockDb(db);
      return { status: 'success', message: 'Menu berhasil dihapus' };
    }
  }

  const sellerMenuAvail = pathname.match(/^\/seller\/menu\/([^\/]+)\/availability$/);
  if (sellerMenuAvail && method === 'PATCH') {
    const mId = sellerMenuAvail[1];
    const m = db.menus.find(item => item.id === mId);
    if (m) {
      m.is_available = bodyData.is_available !== undefined ? bodyData.is_available : !m.is_available;
      saveMockDb(db);
    }
    return { status: 'success', data: m };
  }

  if (pathname === '/seller/queue') {
    const targetStatus = searchParams.get('status') || 'active';
    // Collect all splits for stall-1
    let splits = [];
    db.orders.forEach(o => {
      if (o.splits) {
        o.splits.forEach(sp => {
          if (sp.stall_id === 'stl-1') splits.push(sp);
        });
      }
    });

    if (targetStatus === 'active') {
      splits = splits.filter(s => ['pending', 'preparing', 'ready'].includes(s.status));
    } else if (targetStatus === 'history') {
      splits = splits.filter(s => ['completed', 'cancelled'].includes(s.status));
    }
    return { status: 'success', data: splits };
  }

  const sellerQueueDetail = pathname.match(/^\/seller\/queue\/([^\/]+)$/);
  if (sellerQueueDetail && method === 'GET') {
    const splitId = sellerQueueDetail[1];
    let found = null;
    db.orders.forEach(o => {
      if (o.splits) {
        const s = o.splits.find(sp => sp.id === splitId);
        if (s) found = s;
      }
    });
    return { status: 'success', data: found || db.orders[0].splits[0] };
  }

  const sellerQueueStatus = pathname.match(/^\/seller\/queue\/([^\/]+)\/status$/);
  if (sellerQueueStatus && method === 'PATCH') {
    const splitId = sellerQueueStatus[1];
    const newStatus = bodyData.status;
    db.orders.forEach(o => {
      if (o.splits) {
        const s = o.splits.find(sp => sp.id === splitId);
        if (s) s.status = newStatus;
      }
    });
    saveMockDb(db);
    return { status: 'success', message: 'Status berhasil diperbarui' };
  }

  const sellerQueueVerify = pathname.match(/^\/seller\/queue\/([^\/]+)\/verify$/);
  if (sellerQueueVerify && (method === 'POST' || method === 'PATCH')) {
    const splitId = sellerQueueVerify[1];
    db.orders.forEach(o => {
      if (o.splits) {
        const s = o.splits.find(sp => sp.id === splitId);
        if (s) s.status = 'completed';
      }
    });
    saveMockDb(db);
    return { status: 'success', message: 'Kode berhasil diverifikasi dan pesanan selesai' };
  }

  if (pathname === '/seller/report') {
    const period = searchParams.get('period') || 'daily';
    const reportData = {
      daily: { total_revenue: 456000, items_sold: 28, total_orders: 14 },
      weekly: { total_revenue: 3120000, items_sold: 196, total_orders: 98 },
      monthly: { total_revenue: 12450000, items_sold: 780, total_orders: 390 }
    };
    return { status: 'success', data: reportData[period] || reportData.daily };
  }

  // 8. ADMIN ROUTES
  if (pathname === '/admin/stats') {
    return {
      status: 'success',
      data: {
        total_users: db.users.length,
        total_umkm: db.umkm.length,
        total_stalls: db.stalls.length,
        pending_applications: db.applications_umkm.filter(a => a.status === 'pending').length + db.applications_stall.filter(a => a.status === 'pending').length
      }
    };
  }

  if (pathname === '/admin/metrics') {
    return {
      status: 'success',
      data: {
        active_umkm: db.umkm.filter(u => u.is_active !== false).length,
        total_orders: db.orders.length * 4 + 28,
        total_revenue: 18750000
      }
    };
  }

  if (pathname === '/admin/applications/umkm') {
    return { status: 'success', data: db.applications_umkm };
  }

  if (pathname === '/admin/applications/stall') {
    return { status: 'success', data: db.applications_stall };
  }

  const adminReviewUmkm = pathname.match(/^\/admin\/applications\/umkm\/([^\/]+)\/review$/);
  if (adminReviewUmkm && method === 'PATCH') {
    const appId = adminReviewUmkm[1];
    const app = db.applications_umkm.find(a => a.id === appId);
    if (app) {
      app.status = bodyData.status || 'approved';
      app.admin_notes = bodyData.notes || '';
      saveMockDb(db);
    }
    return { status: 'success', message: 'Pengajuan UMKM berhasil direview' };
  }

  const adminReviewStall = pathname.match(/^\/admin\/applications\/stall\/([^\/]+)\/review$/);
  if (adminReviewStall && method === 'PATCH') {
    const appId = adminReviewStall[1];
    const app = db.applications_stall.find(a => a.id === appId);
    if (app) {
      app.status = bodyData.status || 'approved';
      app.admin_notes = bodyData.notes || '';
      saveMockDb(db);
    }
    return { status: 'success', message: 'Pengajuan Warung berhasil direview' };
  }

  if (pathname === '/admin/users') {
    return { status: 'success', data: db.users };
  }

  const adminUserRole = pathname.match(/^\/admin\/users\/([^\/]+)\/role$/);
  if (adminUserRole && method === 'PATCH') {
    const uId = adminUserRole[1];
    const u = db.users.find(usr => usr.id === uId);
    if (u) {
      u.role = bodyData.role;
      saveMockDb(db);
    }
    return { status: 'success', message: 'Role pengguna berhasil diperbarui' };
  }

  if (pathname === '/admin/umkm') {
    return { status: 'success', data: db.umkm };
  }

  const adminUmkmEdit = pathname.match(/^\/admin\/umkm\/([^\/]+)$/);
  if (adminUmkmEdit && method === 'PATCH') {
    const umkmId = adminUmkmEdit[1];
    const umkm = db.umkm.find(u => u.id === umkmId);
    if (umkm) {
      if (bodyData.name) umkm.name = bodyData.name;
      if (bodyData.city_region) umkm.city_region = bodyData.city_region;
      if (bodyData.full_address) umkm.full_address = bodyData.full_address;
      if (bodyData.description) umkm.description = bodyData.description;
      if (bodyData.is_active !== undefined) umkm.is_active = bodyData.is_active;
      saveMockDb(db);
    }
    return { status: 'success', data: umkm };
  }

  if (pathname === '/admin/stalls') {
    const stallsWithUmkm = db.stalls.map(s => {
      const u = db.umkm.find(item => item.id === s.umkm_location_id);
      return { ...s, umkm_name: u ? u.name : 'Kantin' };
    });
    return { status: 'success', data: stallsWithUmkm };
  }

  const adminStallEdit = pathname.match(/^\/admin\/stalls\/([^\/]+)$/);
  if (adminStallEdit && method === 'PATCH') {
    const stlId = adminStallEdit[1];
    const stl = db.stalls.find(s => s.id === stlId);
    if (stl) {
      if (bodyData.is_active !== undefined) stl.is_active = bodyData.is_active;
      if (bodyData.is_open !== undefined) stl.is_open = bodyData.is_open;
      saveMockDb(db);
    }
    return { status: 'success', data: stl };
  }

  // Fallback for unhandled endpoints
  console.warn(`Mock API: unhandled endpoint ${method} ${pathname}`);
  return { status: 'success', data: [] };
}

// ── Auth Helpers ───────────────────────────────────────────
function getUser() {
  const user = localStorage.getItem('kantinku_user');
  return user ? JSON.parse(user) : null;
}

function getToken() {
  return localStorage.getItem('kantinku_token');
}

function isLoggedIn() {
  return !!getToken() && !!getUser();
}

function saveAuth(token, user) {
  localStorage.setItem('kantinku_token', token);
  localStorage.setItem('kantinku_user', JSON.stringify(user));
}

function getBasePath() {
  const p = window.location.pathname.replace(/\\/g, '/');
  if (p.includes('/seller/') || p.includes('/admin/')) return '../';
  return './';
}

function logout() {
  localStorage.removeItem('kantinku_token');
  localStorage.removeItem('kantinku_user');
  localStorage.removeItem('kantinku_cart');
  window.location.href = getBasePath() + 'login.html';
}

function requireAuth(allowedRoles = []) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = getBasePath() + 'login.html';
    return false;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // For seamless prototype demo, auto-switch role instead of locking out
    const db = getMockDb();
    const needed = db.users.find(u => allowedRoles.includes(u.role));
    if (needed) {
      saveAuth(`mock-token-${needed.role}`, needed);
      return true;
    }
    showToast('Anda tidak memiliki akses ke halaman ini.', 'error');
    window.location.href = getBasePath() + 'index.html';
    return false;
  }

  return true;
}

// ── Cart Helpers (localStorage persistence) ────────────────
function getCart() {
  const cart = localStorage.getItem('kantinku_cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('kantinku_cart', JSON.stringify(cart));
}

function clearCart() {
  localStorage.removeItem('kantinku_cart');
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(c => c.menuItemId === item.menuItemId);

  if (existing) {
    existing.quantity += item.quantity || 1;
    if (item.notes) existing.notes = item.notes;
  } else {
    cart.push({
      menuItemId: item.menuItemId,
      stallId: item.stallId,
      stallName: item.stallName || '',
      name: item.name,
      price: parseFloat(item.price),
      quantity: item.quantity || 1,
      notes: item.notes || '',
      photoUrl: item.photoUrl || ''
    });
  }

  saveCart(cart);
  return cart;
}

function removeFromCart(menuItemId) {
  let cart = getCart();
  cart = cart.filter(c => c.menuItemId !== menuItemId);
  saveCart(cart);
  return cart;
}

function updateCartQuantity(menuItemId, qty) {
  const cart = getCart();
  const item = cart.find(c => c.menuItemId === menuItemId);
  if (item) {
    if (qty <= 0) {
      return removeFromCart(menuItemId);
    }
    item.quantity = qty;
    saveCart(cart);
  }
  return cart;
}

function updateCartNotes(menuItemId, notes) {
  const cart = getCart();
  const item = cart.find(c => c.menuItemId === menuItemId);
  if (item) {
    item.notes = notes;
    saveCart(cart);
  }
  return cart;
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartByStall() {
  const cart = getCart();
  const grouped = {};
  cart.forEach(item => {
    if (!grouped[item.stallId]) {
      grouped[item.stallId] = { stallName: item.stallName, items: [] };
    }
    grouped[item.stallId].items.push(item);
  });
  return grouped;
}

// ── Currency Formatter ─────────────────────────────────────
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

// ── Toast Notification System ──────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const existing = document.querySelectorAll('.kantinku-toast');
  existing.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'kantinku-toast';

  const colors = {
    success: { bg: '#006d3e', icon: 'check_circle' },
    error: { bg: '#ba1a1a', icon: 'error' },
    info: { bg: '#24619d', icon: 'info' },
    warning: { bg: '#ab3500', icon: 'warning' }
  };

  const c = colors[type] || colors.info;

  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(100px);
    background: ${c.bg}; color: #fff; padding: 14px 24px; border-radius: 12px;
    font-family: Inter, sans-serif; font-size: 14px; font-weight: 500;
    display: flex; align-items: center; gap: 10px; z-index: 99999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2); max-width: 90vw;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
    opacity: 0;
  `;

  toast.innerHTML = `
    <span class="material-symbols-outlined" style="font-size: 20px;">${c.icon}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ── Loading Spinner ────────────────────────────────────────
function showLoading(container) {
  if (typeof container === 'string') container = document.querySelector(container);
  if (!container) return;
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-16 gap-4">
      <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p class="text-sm text-on-surface-variant">Memuat data...</p>
    </div>
  `;
}

// ── Date Formatter ─────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return formatDate(dateStr);
}

// ── Status Badge Helper ────────────────────────────────────
function getStatusBadge(status) {
  const map = {
    'pending': { label: 'Menunggu', color: 'bg-amber-100 text-amber-800', icon: 'schedule' },
    'preparing': { label: 'Dimasak', color: 'bg-blue-100 text-blue-800', icon: 'skillet' },
    'ready': { label: 'Siap Diambil', color: 'bg-green-100 text-green-800', icon: 'check_circle' },
    'completed': { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800', icon: 'verified' },
    'cancelled': { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: 'cancel' },
    'approved': { label: 'Disetujui', color: 'bg-green-100 text-green-800', icon: 'check_circle' },
    'rejected': { label: 'Ditolak', color: 'bg-red-100 text-red-800', icon: 'cancel' }
  };
  const s = map[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: 'help' };
  return `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}">
    <span class="material-symbols-outlined text-[14px]">${s.icon}</span>${s.label}
  </span>`;
}

// ── Status Progress Helper ─────────────────────────────────
function getStatusProgress(status) {
  const steps = ['pending', 'preparing', 'ready', 'completed'];
  const idx = steps.indexOf(status);
  if (status === 'cancelled') return -1;
  return idx;
}

// ── Floating Demo Switcher Widget ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Add floating demo toolbar for presenter
  const toolbar = document.createElement('div');
  toolbar.id = 'prototype-demo-toolbar';
  toolbar.style.cssText = `
    position: fixed; bottom: 84px; right: 16px; z-index: 9999;
    font-family: Inter, sans-serif;
  `;

  const base = getBasePath();
  const currentUser = getUser();
  const currentRole = currentUser ? currentUser.role : 'none';

  toolbar.innerHTML = `
    <div id="demo-menu" style="display:none; background:#ffffff; border-radius:16px; box-shadow:0 12px 36px rgba(0,0,0,0.22); border:1px solid #e0e3e6; padding:12px; width:220px; margin-bottom:8px;">
      <div style="font-size:11px; font-weight:700; color:#ab3500; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>Demo Switcher</span>
        <span style="font-size:10px; background:#ffdad6; color:#ba1a1a; padding:2px 6px; border-radius:6px;">PROTOTYPE</span>
      </div>
      <div style="font-size:12px; color:#594139; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #eceef1;">
        Role Aktif: <strong style="color:#ab3500;">${currentRole}</strong>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        <button onclick="switchDemoRole('buyer')" style="text-align:left; padding:8px 10px; border-radius:8px; font-size:12px; font-weight:600; border:none; background:${currentRole === 'buyer' ? '#ff6b3520' : 'transparent'}; color:${currentRole === 'buyer' ? '#ab3500' : '#191c1e'}; cursor:pointer; display:flex; align-items:center; gap:8px;">
          🛒 Mode Pembeli (Buyer)
        </button>
        <button onclick="switchDemoRole('seller')" style="text-align:left; padding:8px 10px; border-radius:8px; font-size:12px; font-weight:600; border:none; background:${currentRole === 'seller' ? '#00b06720' : 'transparent'}; color:${currentRole === 'seller' ? '#006d3e' : '#191c1e'}; cursor:pointer; display:flex; align-items:center; gap:8px;">
          🏪 Dashboard Penjual (Seller)
        </button>
        <button onclick="switchDemoRole('admin')" style="text-align:left; padding:8px 10px; border-radius:8px; font-size:12px; font-weight:600; border:none; background:${currentRole === 'admin' ? '#87bcfe20' : 'transparent'}; color:${currentRole === 'admin' ? '#24619d' : '#191c1e'}; cursor:pointer; display:flex; align-items:center; gap:8px;">
          🛡️ Admin Panel
        </button>
      </div>
      <div style="border-top:1px solid #eceef1; margin-top:8px; padding-top:6px; display:flex; gap:4px;">
        <button onclick="resetMockDb()" style="flex:1; padding:6px; background:#f2f4f7; border:none; border-radius:6px; font-size:11px; font-weight:600; color:#594139; cursor:pointer;">
          🔄 Reset Data
        </button>
        <a href="${base}login.html" style="flex:1; text-align:center; padding:6px; background:#f2f4f7; border-radius:6px; font-size:11px; font-weight:600; color:#ba1a1a; text-decoration:none;">
          🚪 Login
        </a>
      </div>
    </div>
    <button id="demo-toggle-btn" onclick="toggleDemoMenu()" style="background:#ab3500; color:#ffffff; border:none; border-radius:30px; padding:10px 16px; font-size:12px; font-weight:700; box-shadow:0 6px 20px rgba(171,53,0,0.35); cursor:pointer; display:flex; align-items:center; gap:6px;">
      <span>⚡ Demo Control</span>
    </button>
  `;

  document.body.appendChild(toolbar);
});

function toggleDemoMenu() {
  const m = document.getElementById('demo-menu');
  if (m) m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

function switchDemoRole(targetRole) {
  const db = getMockDb();
  const user = db.users.find(u => u.role === targetRole) || db.users[0];
  saveAuth(`mock-token-${targetRole}`, user);
  const base = getBasePath();

  if (targetRole === 'seller') {
    window.location.href = base + 'seller/dashboard.html';
  } else if (targetRole === 'admin') {
    window.location.href = base + 'admin/dashboard.html';
  } else {
    window.location.href = base + 'index.html';
  }
}
