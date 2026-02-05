import Redis from "ioredis";

// Create Redis connection with environment variable support
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Connection event handlers
redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

redis.on("close", () => {
  console.log("🔌 Redis connection closed");
});

// Cache utility functions
export const cacheUtils = {
  // Get data from cache
  async get(key: string): Promise<any | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  },

  // Set data in cache with TTL
  async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
      console.error("Cache set error:", error);
    }
  },

  // Delete data from cache
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  },

  // Delete multiple keys (pattern matching)
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache delete pattern error:", error);
    }
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Cache exists error:", error);
      return false;
    }
  },

  // Set TTL for existing key
  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await redis.expire(key, ttlSeconds);
    } catch (error) {
      console.error("Cache expire error:", error);
    }
  },

  // Get TTL for key
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error("Cache TTL error:", error);
      return -1;
    }
  }
};

// Cache key generators for different data types
export const cacheKeys = {
  users: {
    list: "users:list",
    byId: (id: number) => `users:${id}`,
    byEmail: (email: string) => `users:email:${email}`,
  },
  tasks: {
    list: "tasks:list",
    byId: (id: number) => `tasks:${id}`,
    byStatus: (status: string) => `tasks:status:${status}`,
    byAssignee: (email: string) => `tasks:assignee:${email}`,
  },
  admin: {
    stats: "admin:stats",
    announcements: "admin:announcements",
  }
};

// TTL constants (in seconds)
export const cacheTTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes
  LONG: 1800,     // 30 minutes
  VERY_LONG: 3600 // 1 hour
};

export default redis;
