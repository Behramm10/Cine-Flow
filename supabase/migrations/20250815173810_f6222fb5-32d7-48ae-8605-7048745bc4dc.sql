-- Update showtimes to have dates spread across different days
UPDATE showtimes SET starts_at = '2024-01-15 09:30:00+00' WHERE id = (SELECT id FROM showtimes LIMIT 1 OFFSET 0);
UPDATE showtimes SET starts_at = '2024-01-15 12:00:00+00' WHERE id = (SELECT id FROM showtimes LIMIT 1 OFFSET 1);
UPDATE showtimes SET starts_at = '2024-01-15 15:30:00+00' WHERE id = (SELECT id FROM showtimes LIMIT 1 OFFSET 2);
UPDATE showtimes SET starts_at = '2024-01-15 18:45:00+00' WHERE id = (SELECT id FROM showtimes LIMIT 1 OFFSET 3);
UPDATE showtimes SET starts_at = '2024-01-15 21:00:00+00' WHERE id = (SELECT id FROM showtimes LIMIT 1 OFFSET 4);
UPDATE showtimes SET starts_at = '2024-01-16 10:00:00+00' WHERE id = (SELECT id FROM showtimes LIMIT 1 OFFSET 5);
UPDATE showtimes SET starts_at = '2024-01-16 13:15:00+00' WHERE id = (SELECT id FROM showtimes LIMIT 1 OFFSET 6);
UPDATE showtimes SET starts_at = '2024-01-16 16:30:00+00' WHERE id = (SELECT id FROM showtimes LIMIT 1 OFFSET 7);
UPDATE showtimes SET starts_at = '2024-01-16 19:45:00+00' WHERE id = (SELECT id FROM showtimes LIMIT 1 OFFSET 8);
UPDATE showtimes SET starts_at = '2024-01-17 11:00:00+00' WHERE id = (SELECT id FROM showtimes LIMIT 1 OFFSET 9);