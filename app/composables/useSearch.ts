// composables/useSearch.ts
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import Fuse from 'fuse.js';

// Using 'any' for options to avoid namespace issues
export function useSearch<T>(data: Ref<T[]>, options: any) {
  const searchQuery = ref("");

  const filteredData = computed(() => {
    // 1. If source data is empty/not ready
    if (!data.value || data.value.length === 0) {
      return [];
    }

    // 2. If no search keyword
    if (!searchQuery.value) {
      return data.value;
    }

    // 3. Setup Fuse.js
    try {
      const fuse = new Fuse(data.value, {
        threshold: 0.3, // Typo tolerance
        ignoreLocation: true, // Search anywhere in string
        includeScore: true,
        ...options, // Merge with custom options
      });

      // 4. Perform search
      const results = fuse.search(searchQuery.value);

      // 5. Return original items
      return results.map((result) => result.item);
    } catch (e) {
      console.error("Fuse Error:", e);
      return data.value;
    }
  });

  return {
    searchQuery,
    filteredData,
  };
}