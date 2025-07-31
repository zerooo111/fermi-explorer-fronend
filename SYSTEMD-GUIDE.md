# Systemd Services Management Guide for Fermi Explorer

## What is systemd?

Systemd is the service manager for modern Linux distributions. It starts services at boot, manages their lifecycle, and handles logging. Think of it as a supervisor that keeps your applications running.

## Basic Commands

### Service Status Commands

```bash
# Check if a service is running
sudo systemctl status fermi-backend
sudo systemctl status fermi-frontend

# Check if a service is enabled (will start at boot)
sudo systemctl is-enabled fermi-backend
sudo systemctl is-active fermi-backend
```

### Starting and Stopping Services

```bash
# Start a service
sudo systemctl start fermi-backend
sudo systemctl start fermi-frontend

# Stop a service
sudo systemctl stop fermi-backend
sudo systemctl stop fermi-frontend

# Restart a service (stop then start)
sudo systemctl restart fermi-backend
sudo systemctl restart fermi-frontend

# Reload configuration without stopping
sudo systemctl reload fermi-backend
```

### Enable/Disable Services

```bash
# Enable service to start at boot
sudo systemctl enable fermi-backend
sudo systemctl enable fermi-frontend

# Disable service from starting at boot
sudo systemctl disable fermi-backend
sudo systemctl disable fermi-frontend

# Enable and start in one command
sudo systemctl enable --now fermi-backend
```

## Viewing Logs

### Using journalctl

```bash
# View recent logs
sudo journalctl -u fermi-backend
sudo journalctl -u fermi-frontend

# Follow logs in real-time (like tail -f)
sudo journalctl -u fermi-backend -f
sudo journalctl -u fermi-frontend -f

# View logs from last hour
sudo journalctl -u fermi-backend --since "1 hour ago"

# View logs from specific time range
sudo journalctl -u fermi-backend --since "2024-01-15" --until "2024-01-16"

# Show only last 100 lines
sudo journalctl -u fermi-backend -n 100

# Show logs with priority (error, warning, etc)
sudo journalctl -u fermi-backend -p err
```

### Using log files

Our services also write to log files:

```bash
# Backend logs
tail -f /var/log/fermi-backend/backend.log
tail -f /var/log/fermi-backend/backend-error.log

# Frontend logs
tail -f /var/log/fermi-frontend/frontend.log
tail -f /var/log/fermi-frontend/frontend-error.log
```

## Common Troubleshooting

### Service Won't Start

1. Check the status for errors:
```bash
sudo systemctl status fermi-backend -l
```

2. Check recent logs:
```bash
sudo journalctl -u fermi-backend -n 50 --no-pager
```

3. Check if the port is already in use:
```bash
sudo lsof -i :3001  # For backend
sudo lsof -i :3000  # For frontend
```

4. Verify the executable path exists:
```bash
ls -la /home/ubuntu/.bun/bin/bun
ls -la /home/ubuntu/fermi-explorer-monorepo/apps/backend/src/main.ts
```

### Service Keeps Restarting

Check the restart count:
```bash
sudo systemctl show fermi-backend | grep -E "RestartUSec|NRestarts"
```

### Permission Issues

Ensure the ubuntu user owns the directories:
```bash
sudo chown -R ubuntu:ubuntu /home/ubuntu/fermi-explorer-monorepo
sudo chown -R ubuntu:ubuntu /var/log/fermi-backend
sudo chown -R ubuntu:ubuntu /var/log/fermi-frontend
```

## Modifying Service Configuration

1. Edit the service file:
```bash
sudo nano /etc/systemd/system/fermi-backend.service
```

2. Reload systemd to pick up changes:
```bash
sudo systemctl daemon-reload
```

3. Restart the service:
```bash
sudo systemctl restart fermi-backend
```

## Environment Variables

Add environment variables to your service:

```ini
[Service]
Environment="NODE_ENV=production"
Environment="PORT=3001"
Environment="API_KEY=your-secret-key"
# Or load from a file
EnvironmentFile=/home/ubuntu/fermi-explorer-monorepo/.env
```

## Service Dependencies

Make backend wait for database:
```ini
[Unit]
After=postgresql.service
Requires=postgresql.service
```

## Resource Limits

Add limits to prevent resource exhaustion:
```ini
[Service]
# Memory limit
MemoryLimit=1G
# CPU limit (percentage)
CPUQuota=50%
# Restart if memory exceeds limit
MemoryMax=1G
```

## Monitoring Service Health

### Check service uptime
```bash
sudo systemctl show fermi-backend --property=ActiveEnterTimestamp
```

### Monitor resource usage
```bash
sudo systemctl show fermi-backend --property=MemoryCurrent,CPUUsageNSec
```

### Set up email alerts (requires mail configured)
```ini
[Service]
OnFailure=email-alert@%n.service
```

## Quick Reference

| Task | Command |
|------|---------|
| Start service | `sudo systemctl start fermi-backend` |
| Stop service | `sudo systemctl stop fermi-backend` |
| Restart service | `sudo systemctl restart fermi-backend` |
| Check status | `sudo systemctl status fermi-backend` |
| Enable at boot | `sudo systemctl enable fermi-backend` |
| Disable at boot | `sudo systemctl disable fermi-backend` |
| View logs | `sudo journalctl -u fermi-backend -f` |
| Reload systemd | `sudo systemctl daemon-reload` |

## Best Practices

1. **Always check status after changes**: Run `systemctl status` after any start/stop/restart
2. **Use `--now` flag**: `systemctl enable --now service` to enable and start together
3. **Check logs when debugging**: Use `journalctl -u service -f` to watch logs in real-time
4. **Set resource limits**: Prevent runaway services from consuming all resources
5. **Use proper restart policies**: Set `Restart=on-failure` with `RestartSec` delay
6. **Keep logs manageable**: Configure log rotation to prevent disk fill

## Emergency Commands

If a service is misbehaving:

```bash
# Force stop a service
sudo systemctl kill fermi-backend

# Mask a service (prevent it from starting)
sudo systemctl mask fermi-backend

# Unmask a service
sudo systemctl unmask fermi-backend

# Reset failed state
sudo systemctl reset-failed fermi-backend
```

## Additional Resources

- [Systemd documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- Run `man systemctl` for the full manual
- Run `systemctl --help` for quick help