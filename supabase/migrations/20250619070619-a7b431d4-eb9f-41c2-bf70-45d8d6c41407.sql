
-- Insert demo users for login
INSERT INTO public.users (id_user, name_user, email, role, phone, address) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Admin Kasir', 'kasir@toko.com', 'kasir', '081234567890', 'Jl. Kasir No. 1'),
('550e8400-e29b-41d4-a716-446655440002', 'Pemilik Toko', 'pemilik@toko.com', 'pemilik', '081234567891', 'Jl. Pemilik No. 2'),
('550e8400-e29b-41d4-a716-446655440003', 'Kasir Dua', 'kasir2@toko.com', 'kasir', '081234567892', 'Jl. Kasir No. 3');

-- Insert sample transactions
INSERT INTO public.transactions (user_id, total_amount, payment_method, payment_amount, change_amount, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 50000, 'cash', 50000, 0, 'completed'),
('550e8400-e29b-41d4-a716-446655440001', 75000, 'cash', 80000, 5000, 'completed'),
('550e8400-e29b-41d4-a716-446655440002', 120000, 'card', 120000, 0, 'completed');

-- Update RLS policies untuk users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies untuk users table
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT TO authenticated USING (auth.uid()::text = id_user::text);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid()::text = id_user::text);
CREATE POLICY "Pemilik can view all users" ON public.users FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE id_user::text = auth.uid()::text AND role = 'pemilik'));
CREATE POLICY "Authenticated users can insert users" ON public.users FOR INSERT TO authenticated WITH CHECK (true);

-- Create some sample transaction items
INSERT INTO public.transaction_items (transaction_id, product_id, quantity, unit_price, subtotal)
SELECT 
    t.id,
    p.id,
    2,
    p.price,
    p.price * 2
FROM public.transactions t
CROSS JOIN (SELECT id, price FROM public.products LIMIT 3) p
WHERE t.total_amount > 0
LIMIT 6;
