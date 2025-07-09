-- Action Protection Database Dump
-- Generated for production deployment
-- Use this file to recreate the database structure and data

-- Clean up existing database
DROP DATABASE IF EXISTS actionprotection_db;
DROP USER IF EXISTS actionprotection;

-- Create database and user
CREATE DATABASE actionprotection_db;
CREATE USER actionprotection WITH PASSWORD 'ajHQGHgwqhg3ggagdg';
GRANT ALL PRIVILEGES ON DATABASE actionprotection_db TO actionprotection;
ALTER USER actionprotection CREATEDB;

-- Connect to the database
\c actionprotection_db;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO actionprotection;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO actionprotection;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO actionprotection;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    role TEXT NOT NULL DEFAULT 'moderator',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS website_users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    slug TEXT UNIQUE NOT NULL,
    image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS about_us (
    id SERIAL PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    mission_en TEXT,
    mission_ar TEXT,
    vision_en TEXT,
    vision_ar TEXT,
    hero_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_us (
    id SERIAL PRIMARY KEY,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT NOT NULL,
    address_en TEXT NOT NULL,
    address_ar TEXT NOT NULL,
    google_maps_url TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    youtube_url TEXT,
    tiktok_url TEXT,
    snapchat_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS footer_content (
    id SERIAL PRIMARY KEY,
    company_name_en TEXT NOT NULL,
    company_name_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS widget_settings (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    content_en TEXT,
    content_ar TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_policy (
    id SERIAL PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terms_of_service (
    id SERIAL PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smtp_settings (
    id SERIAL PRIMARY KEY,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    from_email TEXT NOT NULL,
    admin_email TEXT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_addresses (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    delivery_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hero_section (
    id SERIAL PRIMARY KEY,
    background_images TEXT[] NOT NULL DEFAULT '{}',
    typing_words_en TEXT[] NOT NULL DEFAULT '{}',
    typing_words_ar TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experience_section (
    id SERIAL PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    video1_url TEXT,
    video2_url TEXT,
    text1_en TEXT,
    text1_ar TEXT,
    text2_en TEXT,
    text2_ar TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_reviews (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    is_show_on_website BOOLEAN NOT NULL DEFAULT true,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_settings (
    id SERIAL PRIMARY KEY,
    auto_approve BOOLEAN NOT NULL DEFAULT false,
    require_order BOOLEAN NOT NULL DEFAULT false,
    show_on_website BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_permissions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    permission_name TEXT NOT NULL,
    granted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_settings (
    id SERIAL PRIMARY KEY,
    midjourney_api_key TEXT,
    midjourney_api_url TEXT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_customer_reviews_status ON customer_reviews(status);

-- Grant all permissions to actionprotection user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO actionprotection;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO actionprotection;

-- Insert default admin user
INSERT INTO users (
    id, 
    email, 
    username, 
    password, 
    first_name, 
    last_name, 
    role, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'admin_user_production',
    'admin@actionprotection.com',
    'admin',
    '$2b$12$RceGzkZgix24g9Y1BkYX6O5mp7en3Q4fIX1gvcc1DdMIOC2EWngIm',
    'Admin',
    'User',
    'administrator',
    true,
    NOW(),
    NOW()
);

-- Insert default categories
INSERT INTO categories (name_en, name_ar, description_en, description_ar, slug, is_active, sort_order) VALUES
('Thermal Insulator', 'عازل حراري', 'Premium thermal insulation services', 'خدمات العزل الحراري المتميزة', 'thermal-insulator', true, 1),
('Thermal Insulation Protection', 'حماية العزل الحراري', 'Advanced thermal protection systems', 'أنظمة الحماية الحرارية المتقدمة', 'thermal-protection', true, 2),
('Protection', 'الحماية', 'Comprehensive vehicle protection', 'حماية شاملة للمركبات', 'protection', true, 3),
('Polish', 'التلميع', 'Professional polishing services', 'خدمات التلميع الاحترافية', 'polish', true, 4),
('Painting and Vacuuming', 'الطلاء والتنظيف', 'Complete painting and cleaning services', 'خدمات الطلاء والتنظيف الكاملة', 'painting-cleaning', true, 5);

-- Insert default products
INSERT INTO products (name_en, name_ar, description_en, description_ar, price, category_id, sort_order, is_active, is_featured, is_available, stock) VALUES
('Ceramic Thermal Insulation', 'العزل الحراري السيراميكي', 'Advanced ceramic coating for thermal protection', 'طلاء سيراميكي متقدم للحماية الحرارية', 150.00, 1, 1, true, true, true, 100),
('Premium Heat Shield', 'درع الحرارة المتميز', 'High-performance heat protection system', 'نظام حماية حرارية عالي الأداء', 200.00, 2, 1, true, true, true, 50),
('Paint Protection Film', 'فيلم حماية الطلاء', 'Transparent protective film for paint', 'فيلم حماية شفاف للطلاء', 300.00, 3, 1, true, true, true, 75),
('Professional Polish', 'التلميع الاحترافي', 'Premium polishing service', 'خدمة التلميع المتميزة', 80.00, 4, 1, true, false, true, 200),
('Complete Detailing', 'التنظيف الشامل', 'Full vehicle detailing service', 'خدمة تنظيف المركبة بالكامل', 120.00, 5, 1, true, true, true, 100);

-- Insert default content
INSERT INTO about_us (title_en, title_ar, content_en, content_ar, mission_en, mission_ar, vision_en, vision_ar) VALUES
('About Action Protection', 'حول أكشن بروتكشن', 'Leading automotive protection services in Kuwait', 'خدمات حماية السيارات الرائدة في الكويت', 'Protecting your investment', 'حماية استثمارك', 'Excellence in automotive care', 'التميز في العناية بالسيارات');

INSERT INTO contact_us (phone, whatsapp, email, address_en, address_ar, google_maps_url) VALUES
('+965 2245 0123', '+965 9876 5432', 'info@actionprotection.com', 'Kuwait City, Kuwait', 'مدينة الكويت، الكويت', 'https://maps.google.com');

INSERT INTO footer_content (company_name_en, company_name_ar, description_en, description_ar) VALUES
('Action Protection', 'أكشن بروتكشن', 'Premium automotive protection services', 'خدمات حماية السيارات المتميزة');

INSERT INTO widget_settings (name, title_en, title_ar, content_en, content_ar, is_active) VALUES
('tawk_chat', 'Live Chat', 'الدردشة المباشرة', 'Customer support chat', 'دردشة دعم العملاء', true);

INSERT INTO hero_section (background_images, typing_words_en, typing_words_ar) VALUES
('{}', '{"Premium Protection", "Expert Care", "Quality Service"}', '{"حماية متميزة", "عناية متخصصة", "خدمة عالية الجودة"}');

INSERT INTO experience_section (title_en, title_ar, text1_en, text1_ar, text2_en, text2_ar) VALUES
('EXPERIENCE TRUE LUXURY', 'استمتع بالرفاهية الحقيقية', 'Premium automotive protection', 'حماية السيارات المتميزة', 'Excellence in every detail', 'التميز في كل التفاصيل');

INSERT INTO review_settings (auto_approve, require_order, show_on_website) VALUES
(false, false, true);

COMMIT;

-- Success message
\echo 'Database setup completed successfully!'
\echo 'Admin credentials: admin@actionprotection.com / admin123456'