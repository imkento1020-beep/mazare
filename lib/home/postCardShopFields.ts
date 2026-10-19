/** 投稿カードの位置表示（最寄り駅・距離）に必要な shops カラム */
export const POST_CARD_SHOP_FIELDS =
  "id, name, address, genre, open_hours, latitude, longitude, nearest_station";

export const POST_CARD_SHOP_RELATION = `shops ( ${POST_CARD_SHOP_FIELDS} )`;

/** nearest_station 未適用 DB 向けフォールバック */
export const POST_CARD_SHOP_FIELDS_LEGACY =
  "id, name, address, genre, open_hours, latitude, longitude";

export const POST_CARD_SHOP_RELATION_LEGACY = `shops ( ${POST_CARD_SHOP_FIELDS_LEGACY} )`;
