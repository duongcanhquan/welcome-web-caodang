-- Orientation: nhiều SV chung WiFi/NAT → limit 3/IP chặn cả lớp.
-- Nâng mặc định + cập nhật event đang có. 0 = tắt giới hạn IP.
ALTER TABLE public.event_settings
  ALTER COLUMN rate_limit_per_ip SET DEFAULT 500;

UPDATE public.event_settings
SET rate_limit_per_ip = 500
WHERE rate_limit_per_ip IS NULL OR rate_limit_per_ip <= 10;
