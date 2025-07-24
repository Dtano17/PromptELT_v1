import { QueryResult } from '../types/database.js';

export interface CacheEntry {
  id: string;
  query: string;
  parameters?: any[];
  result: QueryResult;
  timestamp: Date;
  databaseId: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: Date;
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
  averageQueryTime: number;
}

export class QueryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    totalQueries: 0
  };
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxCacheSize = 1000;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxSize?: number, defaultTTL?: number) {
    if (maxSize) this.maxCacheSize = maxSize;
    if (defaultTTL) this.defaultTTL = defaultTTL;
    
    // Start cleanup process every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  generateCacheKey(query: string, parameters: any[] = [], databaseId: number): string {
    const normalizedQuery = this.normalizeQuery(query);
    const paramStr = JSON.stringify(parameters);
    return `${databaseId}:${Buffer.from(normalizedQuery + paramStr).toString('base64')}`;
  }

  async get(query: string, parameters: any[] = [], databaseId: number): Promise<QueryResult | null> {
    const key = this.generateCacheKey(query, parameters, databaseId);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.stats.totalQueries++;
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.totalQueries++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = new Date();
    this.stats.hits++;
    this.stats.totalQueries++;

    console.log(`Cache hit for query: ${query.substring(0, 50)}...`);
    return { ...entry.result };
  }

  async set(
    query: string, 
    result: QueryResult, 
    databaseId: number, 
    parameters: any[] = [], 
    customTTL?: number
  ): Promise<void> {
    const key = this.generateCacheKey(query, parameters, databaseId);
    const ttl = customTTL || this.defaultTTL;
    const now = new Date();

    const entry: CacheEntry = {
      id: key,
      query: this.normalizeQuery(query),
      parameters,
      result: { ...result },
      timestamp: now,
      databaseId,
      ttl,
      accessCount: 0,
      lastAccessed: now
    };

    // If cache is full, remove least recently used entries
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    console.log(`Cached query result: ${query.substring(0, 50)}...`);
  }

  async invalidate(pattern?: string, databaseId?: number): Promise<number> {
    let removedCount = 0;

    if (!pattern && !databaseId) {
      // Clear all cache
      removedCount = this.cache.size;
      this.cache.clear();
      console.log(`Cleared entire query cache (${removedCount} entries)`);
      return removedCount;
    }

    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      let shouldDelete = false;

      if (databaseId && entry.databaseId === databaseId) {
        shouldDelete = true;
      }

      if (pattern && entry.query.toLowerCase().includes(pattern.toLowerCase())) {
        shouldDelete = true;
      }

      if (shouldDelete) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      removedCount++;
    }

    console.log(`Invalidated ${removedCount} cache entries`);
    return removedCount;
  }

  private normalizeQuery(query: string): string {
    // Normalize SQL query for consistent caching
    return query
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .trim();
  }

  private evictLRU(): void {
    let oldestEntry: CacheEntry | null = null;
    let oldestKey: string = '';

    for (const [key, entry] of this.cache.entries()) {
      if (!oldestEntry || entry.lastAccessed < oldestEntry.lastAccessed) {
        oldestEntry = entry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`Evicted LRU cache entry: ${oldestEntry?.query.substring(0, 30)}...`);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  getStats(): CacheStats {
    const totalQueries = this.stats.totalQueries || 1; // Avoid division by zero
    const hitRate = (this.stats.hits / totalQueries) * 100;
    
    // Calculate approximate memory usage
    let memoryUsage = 0;
    for (const entry of this.cache.values()) {
      memoryUsage += JSON.stringify(entry).length * 2; // Rough byte estimate
    }

    // Calculate average query time from cached results
    let totalTime = 0;
    let timeCount = 0;
    for (const entry of this.cache.values()) {
      if (entry.result.executionTime) {
        totalTime += entry.result.executionTime;
        timeCount++;
      }
    }
    const averageQueryTime = timeCount > 0 ? totalTime / timeCount : 0;

    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: parseFloat(hitRate.toFixed(2)),
      memoryUsage: Math.round(memoryUsage / 1024), // KB
      averageQueryTime: parseFloat(averageQueryTime.toFixed(2))
    };
  }

  async warmCache(queries: Array<{ query: string; parameters?: any[]; databaseId: number }>): Promise<number> {
    console.log(`Warming cache with ${queries.length} predefined queries...`);
    let warmedCount = 0;

    for (const queryDef of queries) {
      const key = this.generateCacheKey(queryDef.query, queryDef.parameters || [], queryDef.databaseId);
      
      if (!this.cache.has(key)) {
        // Generate mock result for warm-up (in real implementation, execute the query)
        const mockResult: QueryResult = {
          rows: [],
          rowCount: 0,
          query: queryDef.query,
          parameters: queryDef.parameters,
          executionTime: 0
        };

        await this.set(queryDef.query, mockResult, queryDef.databaseId, queryDef.parameters);
        warmedCount++;
      }
    }

    console.log(`Cache warmed with ${warmedCount} new entries`);
    return warmedCount;
  }

  async exportCache(): Promise<string> {
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      entries: Array.from(this.cache.values()).map(entry => ({
        ...entry,
        result: { ...entry.result, rows: entry.result.rows.slice(0, 10) } // Limit rows for export
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  async getCacheEntries(databaseId?: number, limit: number = 50): Promise<CacheEntry[]> {
    const entries = Array.from(this.cache.values());
    
    let filtered = entries;
    if (databaseId) {
      filtered = entries.filter(entry => entry.databaseId === databaseId);
    }

    return filtered
      .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
      .slice(0, limit);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    console.log('Query cache destroyed');
  }
}