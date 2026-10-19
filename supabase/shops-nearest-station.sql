-- お店ごとの最寄り駅名キャッシュ（Google Places で一度取得したら再利用）
alter table shops
add column if not exists nearest_station text;
