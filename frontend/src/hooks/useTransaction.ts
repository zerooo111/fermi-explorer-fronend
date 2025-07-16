/**
 * Transaction Hook for Continuum Sequencer
 * 
 * Provides transaction lookup, validation, and enhanced data processing
 * with automatic caching for immutable transaction data.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { queryKeys, cacheConfig, retryConfig } from '../api/queryKeys';
import type { 
  TransactionResponse, 
  TransactionSearchParams,
  EnhancedTransactionData,
  QueryOptions
} from '../api/types';
import {
  isValidTransactionHash,
  hasTransactionData,
  enhanceTransactionData
} from '../api/types';
import React from 'react';

/**
 * Options for transaction lookup hook
 */
export interface UseTransactionOptions extends QueryOptions {
  /**
   * Whether to validate hash format before making request
   */
  validateHash?: boolean;
  
  /**
   * Enable enhanced data processing (timestamps, decoding, etc.)
   */
  enhanceData?: boolean;
  
  /**
   * Callback when transaction is found
   */
  onTransactionFound?: (transaction: TransactionResponse) => void;
  
  /**
   * Callback when transaction is not found
   */
  onTransactionNotFound?: (hash: string) => void;
  
  /**
   * Whether to enable the query (useful for conditional fetching)
   */
  enabled?: boolean;
}

/**
 * Enhanced transaction result with additional computed properties
 */
export interface TransactionResult {
  /**
   * Raw transaction response from API
   */
  raw: TransactionResponse | undefined;
  
  /**
   * Enhanced transaction data with computed fields
   */
  enhanced: EnhancedTransactionData | null;
  
  /**
   * Whether transaction was found
   */
  found: boolean;
  
  /**
   * Transaction hash used for lookup
   */
  hash: string;
  
  /**
   * Validation status
   */
  isValidHash: boolean;
  
  /**
   * Computed properties
   */
  properties: {
    ageInSeconds: number | null;
    formattedTimestamp: string | null;
    sizeFormatted: string | null;
    decodedTxId: string | null;
  };
}

/**
 * Hook for looking up a specific transaction by hash
 * 
 * @param hash 8-character hexadecimal transaction hash
 * @param options Configuration options for the lookup
 * @returns Query result with transaction data and enhanced properties
 * 
 * @example
 * ```tsx
 * function TransactionDetails({ hash }: { hash: string }) {
 *   const { 
 *     result, 
 *     isLoading, 
 *     isValidHash 
 *   } = useTransaction(hash, {
 *     enhanceData: true,
 *     onTransactionFound: (tx) => console.log('Found:', tx),
 *     onTransactionNotFound: (hash) => console.log('Not found:', hash),
 *   });
 * 
 *   if (!isValidHash) {
 *     return <div>Invalid transaction hash format</div>;
 *   }
 * 
 *   if (isLoading) {
 *     return <div>Loading transaction...</div>;
 *   }
 * 
 *   if (!result.found) {
 *     return <div>Transaction not found</div>;
 *   }
 * 
 *   return (
 *     <div className="transaction-details">
 *       <h3>Transaction {result.hash}</h3>
 *       <p>Tick: {result.raw?.tick_number}</p>
 *       <p>Sequence: {result.raw?.sequence_number}</p>
 *       <p>Size: {result.properties.sizeFormatted}</p>
 *       <p>Age: {result.properties.ageInSeconds}s</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTransaction(
  hash: string, 
  options: UseTransactionOptions = {}
) {
  const {
    validateHash = true,
    enhanceData = false,
    onTransactionFound,
    onTransactionNotFound,
    enabled = true,
    staleTime = cacheConfig.transactions.staleTime,
    retry = retryConfig.data.retry,
    ...queryOptions
  } = options;

  // Validate hash format
  const isValidHash = React.useMemo(() => {
    if (!validateHash) return true;
    return isValidTransactionHash(hash);
  }, [hash, validateHash]);

  // Normalize hash to lowercase for consistency
  const normalizedHash = hash.toLowerCase();

  const query = useQuery<TransactionResponse, Error>({
    queryKey: queryKeys.transactions.detail(normalizedHash),
    queryFn: () => apiClient.get<TransactionResponse>(`/api/v1/tx/${normalizedHash}`),
    staleTime,
    gcTime: cacheConfig.transactions.cacheTime,
    retry,
    retryDelay: retryConfig.data.retryDelay,
    enabled: enabled && isValidHash && hash.length === 8,
    ...queryOptions,
  } as UseQueryOptions<TransactionResponse, Error>);

  // Process and enhance data
  const result = React.useMemo((): TransactionResult => {
    const found = query.data ? hasTransactionData(query.data) : false;
    
    let enhanced: EnhancedTransactionData | null = null;
    let properties = {
      ageInSeconds: null as number | null,
      formattedTimestamp: null as string | null,
      sizeFormatted: null as string | null,
      decodedTxId: null as string | null,
    };

    if (found && query.data && enhanceData && hasTransactionData(query.data)) {
      enhanced = enhanceTransactionData(query.data.transaction);
      
      // Calculate additional properties
      const now = Date.now() * 1000; // Convert to microseconds
      properties = {
        ageInSeconds: Math.floor((now - query.data.transaction.ingestion_timestamp) / 1_000_000),
        formattedTimestamp: enhanced.ingestion_time.formatted,
        sizeFormatted: formatBytes(query.data.transaction.payload_size),
        decodedTxId: enhanced.decoded_tx_id || null,
      };
    } else if (found && query.data && hasTransactionData(query.data)) {
      // Basic properties without enhancement
      const now = Date.now() * 1000;
      properties.ageInSeconds = Math.floor((now - query.data.transaction.ingestion_timestamp) / 1_000_000);
      properties.sizeFormatted = formatBytes(query.data.transaction.payload_size);
    }

    return {
      raw: query.data,
      enhanced,
      found,
      hash: normalizedHash,
      isValidHash,
      properties,
    };
  }, [query.data, enhanceData, normalizedHash, isValidHash]);

  // Handle callbacks
  React.useEffect(() => {
    if (query.isSuccess && result.found && onTransactionFound) {
      onTransactionFound(query.data!);
    }
  }, [query.isSuccess, result.found, query.data, onTransactionFound]);

  React.useEffect(() => {
    if (query.isSuccess && !result.found && onTransactionNotFound) {
      onTransactionNotFound(normalizedHash);
    }
  }, [query.isSuccess, result.found, normalizedHash, onTransactionNotFound]);

  return {
    // Transaction result
    result,
    
    // Query states
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    isError: query.isError,
    
    // Validation
    isValidHash,
    
    // Convenience flags
    found: result.found,
    notFound: query.isSuccess && !result.found,
    
    // Control functions
    refetch: query.refetch,
    
    // Query metadata
    lastUpdated: query.dataUpdatedAt,
  };
}

/**
 * Utility function to format bytes
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Hook for searching transactions with validation and error handling
 * Useful for search interfaces with user input
 * 
 * @param searchParams Parameters for transaction search
 * @param options Configuration options
 * @returns Search result with validation and suggestions
 * 
 * @example
 * ```tsx
 * function TransactionSearch() {
 *   const [hash, setHash] = useState('');
 *   const { 
 *     result, 
 *     search, 
 *     isSearching, 
 *     validationError,
 *     suggestions 
 *   } = useTransactionSearch();
 * 
 *   const handleSearch = () => {
 *     search({ hash, validateFormat: true });
 *   };
 * 
 *   return (
 *     <div>
 *       <input 
 *         value={hash}
 *         onChange={(e) => setHash(e.target.value)}
 *         placeholder="Enter 8-character hex hash"
 *       />
 *       <button onClick={handleSearch} disabled={isSearching}>
 *         Search
 *       </button>
 *       {validationError && <div className="error">{validationError}</div>}
 *       {suggestions.length > 0 && (
 *         <div className="suggestions">
 *           Did you mean: {suggestions.join(', ')}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTransactionSearch() {
  const [searchParams, setSearchParams] = React.useState<TransactionSearchParams | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const query = useTransaction(searchParams?.hash || '', {
    enabled: searchParams !== null,
    validateHash: searchParams?.validateFormat !== false,
    enhanceData: true,
  });

  const search = React.useCallback((params: TransactionSearchParams) => {
    setValidationError(null);
    
    // Validate hash format if requested
    if (params.validateFormat !== false) {
      if (!params.hash) {
        setValidationError('Hash is required');
        return;
      }
      
      if (params.hash.length !== 8) {
        setValidationError('Hash must be exactly 8 characters');
        return;
      }
      
      if (!/^[a-fA-F0-9]+$/.test(params.hash)) {
        setValidationError('Hash must contain only hexadecimal characters (0-9, a-f)');
        return;
      }
    }
    
    setSearchParams(params);
  }, []);

  // Generate suggestions for invalid hashes
  const suggestions = React.useMemo(() => {
    if (!searchParams?.hash || query.isValidHash) return [];
    
    const hash = searchParams.hash;
    const suggestions: string[] = [];
    
    // Suggest removing extra characters
    if (hash.length > 8) {
      suggestions.push(hash.substring(0, 8));
    }
    
    // Suggest padding with zeros
    if (hash.length < 8 && hash.length > 0) {
      suggestions.push(hash.padEnd(8, '0'));
      suggestions.push(hash.padStart(8, '0'));
    }
    
    // Suggest fixing common character issues
    if (/[g-z]/i.test(hash)) {
      suggestions.push(hash.replace(/[g-z]/gi, '0'));
    }
    
    return [...new Set(suggestions)].slice(0, 3); // Unique suggestions, max 3
  }, [searchParams?.hash, query.isValidHash]);

  return {
    // Search result
    result: query.result,
    
    // Search function
    search,
    
    // Query states
    isSearching: query.isLoading,
    error: query.error,
    
    // Validation
    validationError,
    suggestions,
    
    // Current search
    currentSearch: searchParams,
    
    // Clear search
    clear: () => {
      setSearchParams(null);
      setValidationError(null);
    },
  };
}

/**
 * Hook for transaction history/favorites management
 * Provides local storage for recently viewed transactions
 * 
 * @example
 * ```tsx
 * function TransactionHistory() {
 *   const { history, addToHistory, clearHistory } = useTransactionHistory();
 *   
 *   return (
 *     <div>
 *       <h3>Recent Transactions</h3>
 *       {history.map(item => (
 *         <div key={item.hash}>
 *           <Link to={`/tx/${item.hash}`}>{item.hash}</Link>
 *           <span>{item.lastViewed.toLocaleString()}</span>
 *         </div>
 *       ))}
 *       <button onClick={clearHistory}>Clear History</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTransactionHistory() {
  const [history, setHistory] = React.useState<Array<{
    hash: string;
    lastViewed: Date;
    found: boolean;
  }>>([]);

  // Load history from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('transaction-history');
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.map((item: any) => ({
          ...item,
          lastViewed: new Date(item.lastViewed),
        })));
      }
    } catch (error) {
      console.warn('Failed to load transaction history:', error);
    }
  }, []);

  // Save history to localStorage when it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('transaction-history', JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save transaction history:', error);
    }
  }, [history]);

  const addToHistory = React.useCallback((hash: string, found: boolean = true) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.hash !== hash);
      const newItem = { hash, lastViewed: new Date(), found };
      return [newItem, ...filtered].slice(0, 20); // Keep only last 20
    });
  }, []);

  const clearHistory = React.useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = React.useCallback((hash: string) => {
    setHistory(prev => prev.filter(item => item.hash !== hash));
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}