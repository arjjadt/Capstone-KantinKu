-- 1. SUPERTYPE: USERS
CREATE TABLE IF NOT EXISTS USERS (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NULL,
    avatar_url VARCHAR(255) NULL,
    role ENUM('buyer', 'seller', 'admin') NOT NULL DEFAULT 'buyer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. SUBTYPE: SELLERS
CREATE TABLE IF NOT EXISTS SELLERS (
    user_id CHAR(36) PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
);

-- 3. SUBTYPE: ADMINS
CREATE TABLE IF NOT EXISTS ADMINS (
    user_id CHAR(36) PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
);

-- 4. TABEL UMKM_LOCATIONS
CREATE TABLE IF NOT EXISTS UMKM_LOCATIONS (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    city_region VARCHAR(255) NOT NULL,
    full_address TEXT NOT NULL,
    photo_url VARCHAR(255) NULL,
    status ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL,
    approved_by CHAR(36) NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (approved_by) REFERENCES ADMINS(user_id) ON DELETE SET NULL
);

-- 5. TABEL STALLS
CREATE TABLE IF NOT EXISTS STALLS (
    id CHAR(36) PRIMARY KEY,    
    owner_id CHAR(36) NOT NULL,
    umkm_location_id CHAR(36) NOT NULL,
    approved_by CHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    photo_url VARCHAR(255) NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    description TEXT NULL,
    status ENUM('pending', 'approved', 'rejected', 'suspended') NOT NULL,
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES SELLERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (umkm_location_id) REFERENCES UMKM_LOCATIONS(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES ADMINS(user_id) ON DELETE SET NULL
);

-- 6. TABEL MENU_ITEMS
CREATE TABLE IF NOT EXISTS MENU_ITEMS (
    id CHAR(36) PRIMARY KEY,
    stall_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    photo_url VARCHAR(255) NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NULL,
    availability ENUM('available', 'unavailable') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stall_id) REFERENCES STALLS(id) ON DELETE CASCADE
);

-- 7. TABEL ORDERS
CREATE TABLE IF NOT EXISTS ORDERS (
    id CHAR(36) PRIMARY KEY,
    buyer_user_id CHAR(36) NULL,
    status ENUM('pending', 'partial', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_user_id) REFERENCES USERS(id) ON DELETE SET NULL
);

-- 8. TABEL ORDER_SPLITS
CREATE TABLE IF NOT EXISTS ORDER_SPLITS (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    stall_id CHAR(36) NOT NULL,
    queue_number VARCHAR(50) NOT NULL,
    verification_code CHAR(6) NOT NULL,
    dining_option ENUM('dine_in', 'takeaway') NOT NULL,
    status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(stall_id, queue_number),
    FOREIGN KEY (order_id) REFERENCES ORDERS(id) ON DELETE CASCADE,
    FOREIGN KEY (stall_id) REFERENCES STALLS(id) ON DELETE CASCADE
);

-- 9. TABEL ORDER_ITEMS
CREATE TABLE IF NOT EXISTS ORDER_ITEMS (
    id CHAR(36) PRIMARY KEY,
    order_split_id CHAR(36) NOT NULL,
    menu_item_id CHAR(36) NULL,
    menu_name_snapshot VARCHAR(255) NOT NULL,
    price_snapshot DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_split_id) REFERENCES ORDER_SPLITS(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES MENU_ITEMS(id) ON DELETE SET NULL
);

-- 10. TABEL APPLICATIONS (Single Table Inheritance)
CREATE TABLE IF NOT EXISTS APPLICATIONS (
    id CHAR(36) PRIMARY KEY,
    type ENUM('umkm', 'stall') NOT NULL,
    user_id CHAR(36) NOT NULL,
    reviewed_by CHAR(36) NULL,
    proposed_name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    admin_notes TEXT NULL,
    reviewed_at TIMESTAMP NULL,
    -- Kolom khusus UMKM (NULL jika type = 'stall')
    city_region VARCHAR(255) NULL,
    full_address TEXT NULL,
    document_url VARCHAR(255) NULL,
    -- Kolom khusus STALL (NULL jika type = 'umkm')
    umkm_location_id CHAR(36) NULL,
    whatsapp_number VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES ADMINS(user_id) ON DELETE SET NULL,
    FOREIGN KEY (umkm_location_id) REFERENCES UMKM_LOCATIONS(id) ON DELETE CASCADE
);

-- 11. TABEL RATINGS
CREATE TABLE IF NOT EXISTS RATINGS (
    id CHAR(36) PRIMARY KEY,
    order_split_id CHAR(36) NOT NULL,
    menu_item_id CHAR(36) NULL,
    stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
    comment TEXT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_rating_per_order_item UNIQUE (order_split_id, menu_item_id),
    FOREIGN KEY (order_split_id) REFERENCES ORDER_SPLITS(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES MENU_ITEMS(id) ON DELETE SET NULL
);

-- 12. TABEL PAYMENTS
CREATE TABLE IF NOT EXISTS PAYMENTS (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    method ENUM('cash', 'qris', 'transfer') NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    amount DECIMAL(10,2) NOT NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES ORDERS(id) ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX idx_orders_buyer ON ORDERS(buyer_user_id);
CREATE INDEX idx_order_splits_stall ON ORDER_SPLITS(stall_id, status);
CREATE INDEX idx_umkm_city ON UMKM_LOCATIONS(city_region);
CREATE INDEX idx_menu_stall ON MENU_ITEMS(stall_id);
CREATE INDEX idx_applications_type_status ON APPLICATIONS(type, status);
CREATE INDEX idx_stalls_status ON STALLS(status);
