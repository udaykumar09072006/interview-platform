import fs from 'fs';
import path from 'path';

// Robust file-persisted JSON Document Database with indexing and Mongoose-like CRUD API
export interface QueryFilter {
  [key: string]: any;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class Collection<T extends { _id: string; [key: string]: any }> {
  private name: string;
  private filePath: string;
  private memoryCache: Map<string, T> = new Map();
  private isLoaded: boolean = false;

  constructor(name: string) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const items: T[] = JSON.parse(raw);
        this.memoryCache.clear();
        for (const item of items) {
          this.memoryCache.set(item._id, item);
        }
      } else {
        this.persist();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error(`Error loading collection ${this.name}:`, err);
      this.memoryCache.clear();
      this.persist();
      this.isLoaded = true;
    }
  }

  private persist(): void {
    try {
      const items = Array.from(this.memoryCache.values());
      fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error persisting collection ${this.name}:`, err);
    }
  }

  private matchFilter(item: T, filter: QueryFilter): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (key === '_id' && item._id !== value) return false;
      if (value !== undefined && typeof value === 'object' && value !== null) {
        if ('$in' in value && Array.isArray(value.$in)) {
          if (!value.$in.includes(item[key])) return false;
        } else if ('$ne' in value) {
          if (item[key] === value.$ne) return false;
        } else if ('$regex' in value) {
          const reg = new RegExp(value.$regex, value.$options || 'i');
          if (!reg.test(String(item[key] || ''))) return false;
        }
      } else if (value !== undefined) {
        if (item[key] !== value) return false;
      }
    }
    return true;
  }

  async find(filter: QueryFilter = {}): Promise<T[]> {
    const results: T[] = [];
    for (const item of this.memoryCache.values()) {
      if (this.matchFilter(item, filter)) {
        results.push(JSON.parse(JSON.stringify(item)));
      }
    }
    return results;
  }

  async findOne(filter: QueryFilter): Promise<T | null> {
    for (const item of this.memoryCache.values()) {
      if (this.matchFilter(item, filter)) {
        return JSON.parse(JSON.stringify(item));
      }
    }
    return null;
  }

  async findById(id: string): Promise<T | null> {
    const item = this.memoryCache.get(id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string }): Promise<T> {
    const now = new Date().toISOString();
    const id = data._id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newDoc = {
      ...data,
      _id: id,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    this.memoryCache.set(id, newDoc);
    this.persist();
    return JSON.parse(JSON.stringify(newDoc));
  }

  async findByIdAndUpdate(id: string, updates: Partial<T>): Promise<T | null> {
    const item = this.memoryCache.get(id);
    if (!item) return null;

    const updatedDoc: T = {
      ...item,
      ...updates,
      _id: id,
      updatedAt: new Date().toISOString(),
    };

    this.memoryCache.set(id, updatedDoc);
    this.persist();
    return JSON.parse(JSON.stringify(updatedDoc));
  }

  async findByIdAndDelete(id: string): Promise<boolean> {
    const existed = this.memoryCache.delete(id);
    if (existed) {
      this.persist();
    }
    return existed;
  }

  async count(filter: QueryFilter = {}): Promise<number> {
    let count = 0;
    for (const item of this.memoryCache.values()) {
      if (this.matchFilter(item, filter)) {
        count++;
      }
    }
    return count;
  }

  async deleteMany(filter: QueryFilter): Promise<number> {
    let count = 0;
    for (const [id, item] of this.memoryCache.entries()) {
      if (this.matchFilter(item, filter)) {
        this.memoryCache.delete(id);
        count++;
      }
    }
    if (count > 0) this.persist();
    return count;
  }
}

// Database instance container
class Database {
  private collections: Map<string, Collection<any>> = new Map();

  getCollection<T extends { _id: string; [key: string]: any }>(name: string): Collection<T> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Collection<T>(name));
    }
    return this.collections.get(name)!;
  }
}

export const db = new Database();
