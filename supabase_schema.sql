-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  document TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  createdBy TEXT NOT NULL
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customerId UUID REFERENCES customers(id),
  customerName TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  interestRate NUMERIC NOT NULL,
  totalToPay NUMERIC NOT NULL,
  installmentsCount INTEGER NOT NULL,
  frequency TEXT NOT NULL,
  startDate DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  remainingAmount NUMERIC NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  createdBy TEXT NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loanId UUID REFERENCES loans(id),
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  createdBy TEXT NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for now, but should be restricted in production)
CREATE POLICY "Allow all for authenticated users" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON loans FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON payments FOR ALL USING (true);
