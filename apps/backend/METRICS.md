# 📊 Metrics Documentation

The Fermi Explorer backend exposes comprehensive Prometheus metrics for monitoring and observability.

## Metrics Endpoint

**URL**: `GET /metrics`  
**Format**: Prometheus text format  
**Content-Type**: `text/plain; version=0.0.4; charset=utf-8`

## Available Metrics

### HTTP Request Metrics

#### `http_request_duration_seconds`
- **Type**: Histogram
- **Description**: Duration of HTTP requests in seconds
- **Labels**: `method`, `route`, `status_code`
- **Buckets**: `[0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]`

#### `http_requests_total`
- **Type**: Counter
- **Description**: Total number of HTTP requests
- **Labels**: `method`, `route`, `status_code`

### gRPC Client Metrics

#### `grpc_request_duration_seconds`
- **Type**: Histogram
- **Description**: Duration of gRPC requests in seconds
- **Labels**: `method`, `status`
- **Buckets**: `[0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]`

#### `grpc_requests_total`
- **Type**: Counter
- **Description**: Total number of gRPC requests
- **Labels**: `method`, `status`

#### `grpc_connection_status`
- **Type**: Gauge
- **Description**: Status of gRPC connection (1 = connected, 0 = disconnected)

### WebSocket Metrics

#### `websocket_connections_active`
- **Type**: Gauge
- **Description**: Number of active WebSocket connections

#### `websocket_messages_total`
- **Type**: Counter
- **Description**: Total number of WebSocket messages sent
- **Labels**: `type`

#### `websocket_connection_duration_seconds`
- **Type**: Histogram
- **Description**: Duration of WebSocket connections in seconds
- **Buckets**: `[1, 5, 10, 30, 60, 300, 600, 1800, 3600]`

### Application-Specific Metrics

#### `ticks_processed_total`
- **Type**: Counter
- **Description**: Total number of ticks processed

#### `transactions_processed_total`
- **Type**: Counter
- **Description**: Total number of transactions processed

#### `validation_errors_total`
- **Type**: Counter
- **Description**: Total number of validation errors
- **Labels**: `type`, `field`

#### `cache_hits_total` / `cache_misses_total`
- **Type**: Counter
- **Description**: Total number of cache hits/misses
- **Labels**: `cache_type`

### System Health Metrics

#### `last_successful_health_check_timestamp`
- **Type**: Gauge
- **Description**: Timestamp of last successful health check

#### `sequencer_connection_status`
- **Type**: Gauge
- **Description**: Status of connection to Continuum Sequencer (1 = connected, 0 = disconnected)

#### `current_tick_number`
- **Type**: Gauge
- **Description**: Current tick number from sequencer

#### `pending_transactions`
- **Type**: Gauge
- **Description**: Number of pending transactions in sequencer

### Performance Metrics

#### `memory_usage_bytes`
- **Type**: Gauge
- **Description**: Memory usage in bytes
- **Labels**: `type` (rss, heapUsed, heapTotal, external)

#### `response_time_seconds`
- **Type**: Histogram
- **Description**: Response time for various operations
- **Labels**: `operation`
- **Buckets**: `[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]`

#### `errors_total`
- **Type**: Counter
- **Description**: Total number of errors
- **Labels**: `type`, `severity`

#### `api_calls_total`
- **Type**: Counter
- **Description**: Total number of API calls made to external services
- **Labels**: `service`, `endpoint`, `status`

#### `data_freshness_seconds`
- **Type**: Gauge
- **Description**: Age of data in seconds
- **Labels**: `data_type`

### Node.js Process Metrics

The following standard Node.js process metrics are automatically collected:

- `process_cpu_user_seconds_total`
- `process_cpu_system_seconds_total`
- `process_cpu_seconds_total`
- `process_start_time_seconds`
- `process_resident_memory_bytes`
- `nodejs_eventloop_lag_seconds`
- `nodejs_active_handles_total`
- `nodejs_active_requests_total`
- `nodejs_heap_size_total_bytes`
- `nodejs_heap_size_used_bytes`
- `nodejs_external_memory_bytes`
- `nodejs_heap_space_size_total_bytes`
- `nodejs_heap_space_size_used_bytes`
- `nodejs_heap_space_size_available_bytes`
- `nodejs_version_info`

## Example Usage

### Basic Request
```bash
curl http://localhost:3001/metrics
```

### Filter Specific Metrics
```bash
# Get only HTTP request metrics
curl -s http://localhost:3001/metrics | grep http_request

# Get memory usage
curl -s http://localhost:3001/metrics | grep memory_usage

# Get sequencer status
curl -s http://localhost:3001/metrics | grep sequencer_connection_status
```

### Prometheus Configuration

Add this to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'fermi-explorer-backend'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

## Grafana Dashboard

### Recommended Panels

1. **HTTP Request Rate**
   ```promql
   rate(http_requests_total[5m])
   ```

2. **HTTP Request Duration**
   ```promql
   histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
   ```

3. **WebSocket Connections**
   ```promql
   websocket_connections_active
   ```

4. **Memory Usage**
   ```promql
   memory_usage_bytes{type="heapUsed"}
   ```

5. **Sequencer Connection Status**
   ```promql
   sequencer_connection_status
   ```

6. **Error Rate**
   ```promql
   rate(errors_total[5m])
   ```

### Alert Rules

```yaml
groups:
- name: fermi-explorer-backend
  rules:
  - alert: HighErrorRate
    expr: rate(errors_total[5m]) > 0.1
    for: 2m
    annotations:
      summary: "High error rate in Fermi Explorer backend"
  
  - alert: SequencerDisconnected
    expr: sequencer_connection_status == 0
    for: 30s
    annotations:
      summary: "Sequencer connection lost"
  
  - alert: HighMemoryUsage
    expr: memory_usage_bytes{type="heapUsed"} > 500000000
    for: 5m
    annotations:
      summary: "High memory usage in backend"
  
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 2m
    annotations:
      summary: "High response times detected"
```

## Automatic Collection

Metrics are automatically collected for:

- ✅ All HTTP requests (duration, count, status codes)
- ✅ WebSocket connections and messages
- ✅ gRPC client requests
- ✅ Memory usage (updated every 10 seconds)
- ✅ Validation errors
- ✅ API calls to external services
- ✅ System health indicators

## Performance Impact

The metrics collection has minimal performance impact:

- **Memory overhead**: ~1-2MB for metric storage
- **CPU overhead**: <1% additional CPU usage
- **Request latency**: <1ms additional latency per request

## Security Considerations

- The `/metrics` endpoint exposes operational data but no sensitive information
- Consider restricting access to the metrics endpoint in production
- No authentication/authorization is required by default
- Metrics do not contain user data or API keys

## Troubleshooting

### Metrics Not Appearing

1. Check if the endpoint is accessible:
   ```bash
   curl http://localhost:3001/metrics
   ```

2. Verify the application is generating traffic:
   ```bash
   curl http://localhost:3001/api/v1/health
   curl http://localhost:3001/metrics | grep http_request
   ```

3. Check application logs for initialization errors

### High Cardinality Warnings

If you see warnings about high cardinality metrics:

- Review label usage in custom metrics
- Consider reducing the number of unique label values
- Use `histogram_quantile()` instead of creating many histogram buckets

## Development

To add new metrics:

1. Import the metrics system:
   ```typescript
   import { MetricsCollector } from '../metrics/metrics'
   ```

2. Record metrics in your code:
   ```typescript
   MetricsCollector.recordApiCall('external-service', 'get_data', 'success')
   MetricsCollector.recordError('validation', 'warning')
   ```

3. Test locally:
   ```bash
   curl http://localhost:3001/metrics | grep your_metric_name
   ```