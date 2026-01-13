# Deploy PostgreSQL + Redis to Proxmox LXC

This guide will set up PostgreSQL and Redis on your Proxmox LXC container (192.168.1.204) so your PC can connect to them during development.

## Step 1: Upload Docker Compose File to Proxmox LXC

```bash
scp docker/docker-compose.proxmox.yml root@192.168.1.204:/root/xolinks-databases/docker-compose.yml
```

## Step 2: SSH into Proxmox LXC and Start Containers

```bash
ssh root@192.168.1.204
```

Then run:

```bash
# Create directory
mkdir -p /root/xolinks-databases
cd /root/xolinks-databases

# Start containers
docker compose up -d

# Check if they're running
docker ps | grep xolinks
```

You should see both `xolinks-postgres` and `xolinks-redis` running.

## Step 3: Test Connection from Your PC

### Test PostgreSQL:
```bash
# Using psql (if installed)
psql -h 192.168.1.204 -U xolinks -d xolinks -p 5432
# Password: xolinks_secure_password_2024

# Or using Docker on Proxmox LXC
ssh root@192.168.1.204
docker exec -it xolinks-postgres psql -U xolinks -d xolinks
```

### Test Redis:
```bash
# Using redis-cli (if installed)
redis-cli -h 192.168.1.204 -p 6379 -a xolinks_redis_password_2024

# Or using Docker on Proxmox LXC
ssh root@192.168.1.204
docker exec -it xolinks-redis redis-cli -a xolinks_redis_password_2024
```

## Step 4: Run Prisma Migrations (From Your PC)

Back on your PC in the xolinks.me folder:

```bash
npx prisma migrate dev --name init
```

This will create all the database tables on your Proxmox PostgreSQL.

## Step 5: Start Development (On Your PC)

```bash
npm run dev
```

Your Next.js app will now connect to the databases on Proxmox!

---

## Managing the Databases

### View Logs:
```bash
ssh root@192.168.1.204
cd /root/xolinks-databases
docker compose logs -f
```

### Stop Containers:
```bash
docker compose down
```

### Restart Containers:
```bash
docker compose restart
```

### Backup Database:
```bash
docker exec xolinks-postgres pg_dump -U xolinks xolinks > backup_$(date +%Y%m%d).sql
```

---

## Firewall Notes

Make sure ports 5432 (PostgreSQL) and 6379 (Redis) are accessible from your PC on the Proxmox LXC container.

If you have a firewall, allow these ports from your PC's IP address.

---

## Connection Details

- **PostgreSQL**: `192.168.1.204:5432`
  - Username: `xolinks`
  - Password: `xolinks_secure_password_2024`
  - Database: `xolinks`

- **Redis**: `192.168.1.204:6379`
  - Password: `xolinks_redis_password_2024`

These are already configured in your `.env` file!
