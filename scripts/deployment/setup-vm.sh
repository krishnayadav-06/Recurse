#!/bin/bash
set -e

# Detect non-root user if running via sudo
if [ -n "$SUDO_USER" ]; then
  CURRENT_USER="$SUDO_USER"
  USER_HOME=$(getent passwd "$SUDO_USER" | cut -d: -f6)
else
  CURRENT_USER=$(whoami)
  USER_HOME="$HOME"
fi

echo "====================================================="
echo " Starting Recurse V2 Server Setup on Linux VM"
echo " Target User: $CURRENT_USER ($USER_HOME)"
echo " Compatible with: Azure VM, AWS EC2, DigitalOcean, etc."
echo "====================================================="

# 1. System Updates & Docker
echo "Installing Docker..."
apt-get update -y
apt-get install -y docker.io docker-compose git curl ufw
systemctl enable --now docker

# Add user to docker group if non-root
if [ "$CURRENT_USER" != "root" ]; then
  usermod -aG docker "$CURRENT_USER"
fi

# 2. Node.js & PM2
echo "Installing Node.js 20 & PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# 3. Caddy (Reverse Proxy with Automatic SSL)
echo "Installing Caddy..."
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg --yes
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update -y && apt-get install -y caddy

# 4. Piston Execution Engine
echo "Configuring Piston Sandboxed Runner..."
mkdir -p "$USER_HOME/piston"
cat << 'EOF' > "$USER_HOME/piston/docker-compose.yml"
version: "3"
services:
  piston:
    image: ghcr.io/engineer-man/piston
    container_name: recursev2-piston-1
    restart: always
    privileged: true
    environment:
      - PISTON_OUTPUT_MAX_SIZE=10000000
      - PISTON_MAX_OUTPUT_MAX_SIZE=10000000
      - PISTON_RUN_TIMEOUT=30000
      - PISTON_MAX_RUN_TIMEOUT=30000
      - PISTON_COMPILE_TIMEOUT=30000
      - PISTON_MAX_COMPILE_TIMEOUT=30000
      - PISTON_RUN_MEMORY_LIMIT=536870912
      - PISTON_COMPILE_MEMORY_LIMIT=536870912
    ports:
      - "127.0.0.1:2000:2000"
    volumes:
      - piston_packages:/piston/packages
    tmpfs:
      - /tmp:exec
volumes:
  piston_packages:
EOF

chown -R "$CURRENT_USER:$CURRENT_USER" "$USER_HOME/piston" || true
cd "$USER_HOME/piston"
docker-compose up -d

echo "Installing Piston Languages (Python, C++, Java)..."
sleep 5 # Wait for container to initialize
docker exec recursev2-piston-1 cli/index.js ppman install python c++ java

# 5. Project Directory & GitHub Actions Prep
echo "Setting up Project Directory..."
cd "$USER_HOME"
if [ ! -d "$USER_HOME/_Recurse" ]; then
  git clone https://github.com/krishnayadav-06/_Recurse.git "$USER_HOME/_Recurse"
  chown -R "$CURRENT_USER:$CURRENT_USER" "$USER_HOME/_Recurse" || true
fi

# 6. PM2 Startup Resilience
echo "Configuring PM2 Startup for $CURRENT_USER..."
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u "$CURRENT_USER" --hp "$USER_HOME" || true

# 7. Caddy Configuration Template
if [ -f "$USER_HOME/_Recurse/scripts/deployment/Caddyfile" ]; then
  echo "Installing Caddyfile..."
  cp "$USER_HOME/_Recurse/scripts/deployment/Caddyfile" /etc/caddy/Caddyfile
fi

# 8. Firewall Setup (OS Level)
echo "Configuring UFW Firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "====================================================="
echo " Setup Complete!"
echo "====================================================="
echo ""
echo "Next steps:"
echo "1. Configure environment variables:"
echo "   nano $USER_HOME/_Recurse/.env.local"
echo "2. Edit Caddyfile with your domain / DNS name:"
echo "   sudo nano /etc/caddy/Caddyfile"
echo "   sudo systemctl restart caddy"
echo "3. Build and launch Next.js via PM2:"
echo "   cd $USER_HOME/_Recurse"
echo "   npm install"
echo "   npm run build"
echo "   pm2 start ecosystem.config.cjs"
echo "   pm2 save"
echo ""
echo "NOTE FOR AZURE USERS:"
echo "- Ensure your Azure VM Network Security Group (NSG) has Inbound rules"
echo "  allowing port 80 (HTTP) and port 443 (HTTPS)."
echo "- Ensure your Azure Public IP is set to 'Static'."
