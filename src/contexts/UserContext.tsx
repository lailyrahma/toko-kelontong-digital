
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'kasir' | 'pemilik';
}

interface Store {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  session: Session | null;
  store: Store;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  updateStore: (storeData: Partial<Store>) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store>({
    name: 'Toko Kelontong Barokah',
    address: 'Jl. Mawar No. 123, Jakarta',
    phone: '021-12345678',
    email: 'tokobarokah@email.com'
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile from database
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id_user', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUser({
          id: data.id_user,
          name: data.name_user,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          role: data.role as 'kasir' | 'pemilik'
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Untuk demo, kita akan simulasi login dengan data yang ada
      // Cari user berdasarkan email di database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        toast.error('Email tidak ditemukan atau salah');
        return false;
      }

      // Validasi password sederhana untuk demo
      const validPasswords: Record<string, string> = {
        'kasir@toko.com': 'kasir123',
        'pemilik@toko.com': 'pemilik123',
        'kasir2@toko.com': 'kasir123'
      };

      if (validPasswords[email] !== password) {
        toast.error('Password salah');
        return false;
      }

      // Set user data
      setUser({
        id: userData.id_user,
        name: userData.name_user,
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address || '',
        role: userData.role as 'kasir' | 'pemilik'
      });

      // Simulasi session untuk demo
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: userData.id_user,
          email: userData.email,
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as SupabaseUser
      } as Session);

      toast.success('Login berhasil!');
      return true;

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Terjadi kesalahan saat login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setSession(null);
      toast.success('Logout berhasil!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Terjadi kesalahan saat logout');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const updateStore = (storeData: Partial<Store>) => {
    setStore({ ...store, ...storeData });
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      session, 
      store, 
      login, 
      logout, 
      updateUser, 
      updateStore, 
      loading 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
