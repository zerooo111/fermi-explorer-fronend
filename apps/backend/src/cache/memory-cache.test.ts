import { MemoryCache } from "./memory-cache";

// Simple test for the memory cache
async function testMemoryCache() {
  console.log("🧪 Testing MemoryCache...");

  const cache = new MemoryCache<string>(1); // 1 minute TTL

  // Test basic set/get
  cache.set("test-key", "test-value");
  const value = cache.get("test-key");
  console.assert(value === "test-value", "Basic set/get should work");

  // Test TTL expiration
  cache.set("expire-key", "expire-value", 0.01); // 0.6 seconds TTL
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  const expiredValue = cache.get("expire-key");
  console.assert(expiredValue === null, "Expired values should return null");

  // Test cache size
  cache.set("key1", "value1");
  cache.set("key2", "value2");
  console.assert(cache.size() >= 2, "Cache size should reflect entries");

  // Test cleanup
  cache.set("cleanup1", "value1", 0.01); // Very short TTL
  cache.set("cleanup2", "value2", 0.01);
  await new Promise(resolve => setTimeout(resolve, 1000));
  const cleanedUp = cache.cleanup();
  console.assert(cleanedUp >= 2, "Cleanup should remove expired entries");

  console.log("✅ All MemoryCache tests passed!");
}

testMemoryCache().catch(console.error);