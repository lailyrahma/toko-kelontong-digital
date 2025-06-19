
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table  
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  barcode TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.users(id_user),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_amount DECIMAL(10,2) NOT NULL,
  change_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transaction_items table
CREATE TABLE public.transaction_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES
('Makanan', 'Produk makanan dan snack'),
('Minuman', 'Minuman segar dan berkarbonasi'),
('Elektronik', 'Perangkat elektronik dan aksesoris'),
('Pakaian', 'Pakaian dan aksesoris fashion'),
('Kesehatan', 'Produk kesehatan dan perawatan');

-- Insert sample products
INSERT INTO public.products (name, description, price, stock, category_id, barcode) VALUES
('Nasi Goreng Spesial', 'Nasi goreng dengan telur dan ayam', 25000, 50, (SELECT id FROM public.categories WHERE name = 'Makanan' LIMIT 1), '1234567890001'),
('Mie Ayam', 'Mie ayam dengan pangsit', 20000, 30, (SELECT id FROM public.categories WHERE name = 'Makanan' LIMIT 1), '1234567890002'),
('Es Teh Manis', 'Teh manis dingin segar', 5000, 100, (SELECT id FROM public.categories WHERE name = 'Minuman' LIMIT 1), '1234567890003'),
('Kopi Hitam', 'Kopi hitam panas', 8000, 80, (SELECT id FROM public.categories WHERE name = 'Minuman' LIMIT 1), '1234567890004'),
('Charger HP', 'Charger universal untuk smartphone', 35000, 20, (SELECT id FROM public.categories WHERE name = 'Elektronik' LIMIT 1), '1234567890005'),
('Kaos Polos', 'Kaos polos berbagai warna', 45000, 25, (SELECT id FROM public.categories WHERE name = 'Pakaian' LIMIT 1), '1234567890006'),
('Masker Wajah', 'Masker kesehatan 3 layer', 15000, 200, (SELECT id FROM public.categories WHERE name = 'Kesehatan' LIMIT 1), '1234567890007'),
('Juice Jeruk', 'Jus jeruk segar', 12000, 40, (SELECT id FROM public.categories WHERE name = 'Minuman' LIMIT 1), '1234567890008'),
('Roti Bakar', 'Roti bakar dengan selai', 15000, 35, (SELECT id FROM public.categories WHERE name = 'Makanan' LIMIT 1), '1234567890009'),
('Hand Sanitizer', 'Hand sanitizer 100ml', 18000, 60, (SELECT id FROM public.categories WHERE name = 'Kesehatan' LIMIT 1), '1234567890010');

-- Enable Row Level Security (RLS) untuk semua tabel
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Create policies untuk categories
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

-- Create policies untuk products
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE TO authenticated USING (true);

-- Create policies untuk transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid()::text = user_id::text OR EXISTS (SELECT 1 FROM public.users WHERE id_user::text = auth.uid()::text AND role = 'pemilik'));
CREATE POLICY "Authenticated users can insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid()::text = user_id::text OR EXISTS (SELECT 1 FROM public.users WHERE id_user::text = auth.uid()::text AND role = 'pemilik'));

-- Create policies untuk transaction_items
CREATE POLICY "Users can view transaction items of their transactions" ON public.transaction_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.transactions WHERE id = transaction_id AND (auth.uid()::text = user_id::text OR EXISTS (SELECT 1 FROM public.users WHERE id_user::text = auth.uid()::text AND role = 'pemilik'))));
CREATE POLICY "Authenticated users can insert transaction items" ON public.transaction_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update transaction items of their transactions" ON public.transaction_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.transactions WHERE id = transaction_id AND (auth.uid()::text = user_id::text OR EXISTS (SELECT 1 FROM public.users WHERE id_user::text = auth.uid()::text AND role = 'pemilik'))));

-- Create indexes untuk performance
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_transaction_items_transaction_id ON public.transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON public.transaction_items(product_id);

-- Create function untuk generate transaction number
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT AS $$
DECLARE
    trans_number TEXT;
    counter INTEGER;
BEGIN
    -- Get today's date in YYYYMMDD format
    trans_number := 'TRX' || TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Get count of transactions today
    SELECT COUNT(*) + 1 INTO counter
    FROM public.transactions 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Append counter with leading zeros
    trans_number := trans_number || LPAD(counter::TEXT, 4, '0');
    
    RETURN trans_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger untuk auto-generate transaction number
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
        NEW.transaction_number := generate_transaction_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_transaction_number
    BEFORE INSERT ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_number();

-- Create function untuk update stock setelah transaksi
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Kurangi stock saat item transaksi ditambahkan
        UPDATE public.products 
        SET stock = stock - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Tambah kembali stock saat item transaksi dihapus
        UPDATE public.products 
        SET stock = stock + OLD.quantity,
            updated_at = NOW()
        WHERE id = OLD.product_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Adjust stock berdasarkan perubahan quantity
        UPDATE public.products 
        SET stock = stock - (NEW.quantity - OLD.quantity),
            updated_at = NOW()
        WHERE id = NEW.product_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_stock
    AFTER INSERT OR UPDATE OR DELETE ON public.transaction_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();
