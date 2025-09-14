import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { createHash } from 'crypto';

// Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  skipCache?: (req: Request) => boolean;
  tags?: string[];
}

// Default cache options
const defaultOptions: CacheOptions = {
  ttl: 300, // 5 minutes
  keyGenerator: (req: Request) => {
    const hash = createHash('md5');
    hash.update(req.method + req.originalUrl + JSON.stringify(req.query));
    return hash.digest('hex');
  },
  skipCache: () => false,
};

// Cache middleware factory
export const cache = (options: CacheOptions = {}) => {
  const opts = { ...defaultOptions, ...options };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests or if skipCache returns true
    if (req.method !== 'GET' || opts.skipCache!(req)) {
      return next();
    }

    try {
      const cacheKey = `cache:${opts.keyGenerator!(req)}`;
      
      // Try to get from cache
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        
        // Set cache headers
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Timestamp': timestamp,
        });
        
        return res.json(data);
      }
      
      // Cache miss - intercept response
      const originalJson = res.json;
      res.json = function(body: any) {
        // Store in cache
        const cacheData = {
          data: body,
          timestamp: new Date().toISOString(),
        };
        
        redis.setex(cacheKey, opts.ttl!, JSON.stringify(cacheData));
        
        // Set cache headers
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Timestamp': new Date().toISOString(),
        });
        
        // Call original json method
        return originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error('Cache error:', error);
      // Continue without caching if Redis fails
      next();
    }
  };
};

// Cache invalidation
export const invalidateCache = async (pattern: string) => {
  try {
    const keys = await redis.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

// Cache tags for grouped invalidation
export const cacheWithTags = (tags: string[], ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const keyGenerator = defaultOptions.keyGenerator!;
      const cacheKey = `cache:${keyGenerator(req)}`;
      
      // Try to get from cache
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Timestamp': timestamp,
        });
        
        return res.json(data);
      }
      
      // Cache miss
      const originalJson = res.json;
      res.json = function(body: any) {
        const cacheData = {
          data: body,
          timestamp: new Date().toISOString(),
          tags,
        };
        
        // Store in cache
        redis.setex(cacheKey, ttl, JSON.stringify(cacheData));
        
        // Store tags for invalidation
        tags.forEach(tag => {
          redis.sadd(`cache:tags:${tag}`, cacheKey);
        });
        
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Timestamp': new Date().toISOString(),
        });
        
        return originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      console.error('Cache with tags error:', error);
      next();
    }
  };
};

// Invalidate cache by tags
export const invalidateCacheByTags = async (tags: string[]) => {
  try {
    for (const tag of tags) {
      const keys = await redis.smembers(`cache:tags:${tag}`);
      if (keys.length > 0) {
        await redis.del(...keys);
        await redis.del(`cache:tags:${tag}`);
      }
    }
  } catch (error) {
    console.error('Cache tag invalidation error:', error);
  }
};

// Response compression
export const compressResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(body: any) {
    // Only compress if response is large enough
    const bodyString = JSON.stringify(body);
    if (bodyString.length > 1024) { // 1KB threshold
      res.set('Content-Encoding', 'gzip');
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

// Database query caching
export const queryCache = {
  async get(key: string) {
    try {
      const cached = await redis.get(`query:${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Query cache get error:', error);
      return null;
    }
  },
  
  async set(key: string, data: any, ttl: number = 300) {
    try {
      await redis.setex(`query:${key}`, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Query cache set error:', error);
    }
  },
  
  async del(key: string) {
    try {
      await redis.del(`query:${key}`);
    } catch (error) {
      console.error('Query cache del error:', error);
    }
  },
  
  async clear(pattern: string = '*') {
    try {
      const keys = await redis.keys(`query:${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Query cache clear error:', error);
    }
  },
};

// Cache warming
export const warmCache = async (key: string, dataFetcher: () => Promise<any>, ttl: number = 300) => {
  try {
    const data = await dataFetcher();
    await queryCache.set(key, data, ttl);
    return data;
  } catch (error) {
    console.error('Cache warming error:', error);
    throw error;
  }
};

// Cache statistics
export const getCacheStats = async () => {
  try {
    const info = await redis.info('memory');
    const keys = await redis.keys('cache:*');
    const queryKeys = await redis.keys('query:*');
    
    return {
      memoryInfo: info,
      cacheKeys: keys.length,
      queryKeys: queryKeys.length,
      totalKeys: keys.length + queryKeys.length,
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return null;
  }
};

// Cache health check
export const cacheHealthCheck = async () => {
  try {
    await redis.ping();
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
};

export default {
  cache,
  invalidateCache,
  cacheWithTags,
  invalidateCacheByTags,
  compressResponse,
  queryCache,
  warmCache,
  getCacheStats,
  cacheHealthCheck,
};
