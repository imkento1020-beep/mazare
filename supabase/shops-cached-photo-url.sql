-- Place Photos API の URL を1店舗1回だけ保存（以降は API を叩かない）
alter table shops
add column if not exists cached_photo_url text;
