export type LandingDemoPost = {
  id: string;
  authorDisplayName: string;
  imageUrl: string;
  shopName: string;
  area: string;
  visitOrder: number;
  tonightCups: number;
  drinkName?: string;
  partySize: number;
  comment: string;
  interestCount: number;
  commentCount: number;
  postedAtLabel: string;
};

/** ランディング先頭用（実投稿風デモ・固定アセット） */
export const LANDING_DEMO_POSTS: LandingDemoPost[] = [
  {
    id: "demo-shibuya",
    authorDisplayName: "yuki",
    imageUrl: "/landing/demo-tachinomi.jpg",
    shopName: "立ち飲み ネオン横丁",
    area: "渋谷駅 · 0.4km",
    visitOrder: 2,
    tonightCups: 4,
    drinkName: "ハイボール",
    partySize: 3,
    comment: "カウンター埋まってて雰囲気最高。 #渋谷 #今夜 #ハイボール",
    interestCount: 14,
    commentCount: 5,
    postedAtLabel: "23:18",
  },
  {
    id: "demo-shinjuku",
    authorDisplayName: "kenta",
    imageUrl: "/landing/demo-darts.jpg",
    shopName: "DARTS BAR 新宿南口",
    area: "新宿駅 · 0.8km",
    visitOrder: 1,
    tonightCups: 2,
    drinkName: "生ビール",
    partySize: 4,
    comment: "ダーツしながら飲んでる。混ざり歓迎ムード。 #新宿 #ダーツ",
    interestCount: 9,
    commentCount: 3,
    postedAtLabel: "22:41",
  },
  {
    id: "demo-ebisu",
    authorDisplayName: "mio",
    imageUrl: "/landing/demo-bar-counter.jpg",
    shopName: "ビアバー HOP EBISU",
    area: "恵比寿駅 · 1.1km",
    visitOrder: 3,
    tonightCups: 6,
    drinkName: "IPA",
    partySize: 2,
    comment: "2軒目から来たけどここが一番楽しい。 #恵比寿 #クラフトビール",
    interestCount: 21,
    commentCount: 8,
    postedAtLabel: "0:07",
  },
];
