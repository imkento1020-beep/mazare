import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { Shop, ShopFormData } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const SHOPS_FILE = join(DATA_DIR, "shops.json");

function ensureDataFile(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(SHOPS_FILE)) {
    writeFileSync(SHOPS_FILE, "[]", "utf-8");
  }
}

function readShops(): Shop[] {
  ensureDataFile();
  const raw = readFileSync(SHOPS_FILE, "utf-8");
  return JSON.parse(raw) as Shop[];
}

function writeShops(shops: Shop[]): void {
  ensureDataFile();
  writeFileSync(SHOPS_FILE, JSON.stringify(shops, null, 2), "utf-8");
}

export function listShops(): Shop[] {
  return readShops().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getShop(id: string): Shop | undefined {
  return readShops().find((shop) => shop.id === id);
}

export function createShop(data: ShopFormData): Shop {
  const now = new Date().toISOString();
  const shop: Shop = {
    id: randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const shops = readShops();
  shops.push(shop);
  writeShops(shops);

  return shop;
}

export function updateShop(id: string, data: ShopFormData): Shop | undefined {
  const shops = readShops();
  const index = shops.findIndex((shop) => shop.id === id);
  if (index === -1) return undefined;

  const updated: Shop = {
    ...shops[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  shops[index] = updated;
  writeShops(shops);

  return updated;
}
