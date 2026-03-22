-- SQL Blueprint for Supabase (PostgreSQL)
-- This file defines the schema for the CredGestor application.

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    document TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Loans Table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    interest_rate NUMERIC NOT NULL,
    installments INTEGER NOT NULL,
    start_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'late'
    remaining_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    method TEXT, -- 'pix', 'cash', 'transfer'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT DEFAULT 'CredGestor',
    currency TEXT DEFAULT 'BRL',
    theme TEXT DEFAULT 'light',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policies for Customers
CREATE POLICY "Users can manage their own customers" ON public.customers
    FOR ALL USING (auth.uid() = user_id);

-- Policies for Loans
CREATE POLICY "Users can manage their own loans" ON public.loans
    FOR ALL USING (auth.uid() = user_id);

-- Policies for Payments
CREATE POLICY "Users can manage their own payments" ON public.payments
    FOR ALL USING (auth.uid() = user_id);

-- Policies for Settings
CREATE POLICY "Users can manage their own settings" ON public.settings
    FOR ALL USING (auth.uid() = user_id);
