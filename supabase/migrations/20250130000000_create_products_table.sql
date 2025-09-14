/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (text, primary key)
      - `name` (text, not null)
      - `price` (numeric, not null)
      - `image` (text, not null)
      - `category` (text, not null)
      - `rating` (numeric, default 0)
      - `in_stock` (boolean, default true)
      - `description` (text)
      - `designer` (text)
      - `article_number` (text)
      - `images` (text array)
      - `try_own` (boolean, default false)
      - `category_flag` (boolean, default false)
      - `key_words` (text array)
      - `more_info` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for public read access
    - Add policies for authenticated users to manage products

  3. Indexes
    - Create indexes for better performance on common queries
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  image text NOT NULL,
  category text NOT NULL,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  in_stock boolean DEFAULT true,
  description text,
  designer text,
  article_number text,
  images text[],
  try_own boolean DEFAULT false,
  category_flag boolean DEFAULT false,
  key_words text[],
  more_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated users to insert/update/delete
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_designer_idx ON products(designer);
CREATE INDEX IF NOT EXISTS products_price_idx ON products(price);
CREATE INDEX IF NOT EXISTS products_rating_idx ON products(rating);
CREATE INDEX IF NOT EXISTS products_in_stock_idx ON products(in_stock);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products(created_at);

-- Create GIN indexes for array columns
CREATE INDEX IF NOT EXISTS products_images_gin_idx ON products USING GIN(images);
CREATE INDEX IF NOT EXISTS products_key_words_gin_idx ON products USING GIN(key_words);