-- Assign a representative image (hosted in Supabase Storage) to each property
-- based on its Type.
-- Run this in the Supabase SQL editor. "desc" is double-quoted because DESC is a reserved word.

-- 1. Appartements & Studios -> appartement.jpg
UPDATE public.morocco_properties
SET "desc" = 'https://lvplxnfcuofvffbnurye.supabase.co/storage/v1/object/public/property_images/appartement.jpg'
WHERE "Type" IN ('Appartement', 'Studio');

-- 2. تحديث Bureau و plateau برابط المكاتب
UPDATE public.morocco_properties
SET "desc" = 'https://lvplxnfcuofvffbnurye.supabase.co/storage/v1/object/public/property_images/bereau%20,plateau%20.jpeg'
WHERE "Type" IN ('Bureau', 'plateau', 'Bureau / Plateau');

-- 3. تحديث Villa برابط الفيلات
UPDATE public.morocco_properties
SET "desc" = 'https://lvplxnfcuofvffbnurye.supabase.co/storage/v1/object/public/property_images/villa.jpg'
WHERE "Type" = 'Villa';
