/*
  # Create saved cities table

  1. New Tables
    - `saved_cities`
      - `id` (uuid, primary key) - Unique identifier for each saved city
      - `user_id` (text) - Browser fingerprint/identifier to remember users
      - `city_name` (text) - Name of the selected city
      - `latitude` (numeric) - Latitude coordinate of the city
      - `longitude` (numeric) - Longitude coordinate of the city
      - `country` (text) - Country where the city is located
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `saved_cities` table
    - Add policy for users to read their own saved city data
    - Add policy for users to insert their own city data
    - Add policy for users to update their own city data

  3. Important Notes
    - Uses a unique constraint on `user_id` to ensure one city per user
    - Browser fingerprint stored in localStorage will identify returning users
*/

CREATE TABLE IF NOT EXISTS saved_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  city_name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  country text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own saved city"
  ON saved_cities FOR SELECT
  USING (user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can insert their own city"
  ON saved_cities FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can update their own city"
  ON saved_cities FOR UPDATE
  USING (user_id = current_setting('request.jwt.claim.sub', true))
  WITH CHECK (user_id = current_setting('request.jwt.claim.sub', true));

CREATE INDEX IF NOT EXISTS saved_cities_user_id_idx ON saved_cities(user_id);