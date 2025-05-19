import { createClient } from '@supabase/supabase-js';

// Environment variables would normally be provided for these values
// For development, we'll use fallback values until the actual keys are provided
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication helpers
export async function signUp(email: string, password: string, userData: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
}

// Database helpers
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  return { data, error };
}

export async function fetchProductsByCategory(categoryId: number) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('categoryId', categoryId);
  return { data, error };
}

export async function fetchProduct(id: number) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// Real-time subscription helpers
export function subscribeToProducts(callback: (payload: any) => void) {
  return supabase
    .channel('public:products')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'products'
      }, 
      callback
    )
    .subscribe();
}

export function subscribeToOrders(userId: number, callback: (payload: any) => void) {
  return supabase
    .channel('public:orders')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'orders',
        filter: `userId=eq.${userId}`
      }, 
      callback
    )
    .subscribe();
}

// Seller-specific functions
export async function createProduct(productData: any) {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select();
  return { data, error };
}

export async function updateProduct(id: number, productData: any) {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select();
  return { data, error };
}

export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  return { error };
}

// File upload for product images
export async function uploadProductImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  return { data, error };
}

export function getProductImageUrl(path: string) {
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(path);
  return data.publicUrl;
}