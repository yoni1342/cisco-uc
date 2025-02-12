# Cisco UC Chat Application

A full-stack chat application using Next.js, n8n for automation, and Nginx as a reverse proxy, all containerized with Docker. The application provides a persistent chat interface that integrates with Cisco UC services through n8n workflows.

## 🏗 Architecture

```
┌─────────────┐     ┌──────────┐     ┌─────────────────────┐
│   Next.js   │────▶│  Nginx   │────▶│   n8n (Separate)   │
│  Frontend   │◀────│  Proxy   │◀────│   with own Nginx   │
└─────────────┘     └──────────┘     └─────────────────────┘
```

### Components
- **Frontend**: Next.js 13+ with TypeScript and Tailwind CSS
- **Main Proxy**: Nginx reverse proxy for frontend and n8n routing
- **n8n Setup**: Separate containerized n8n instance with its own Nginx proxy

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Set up n8n environment:
```bash
# In n8n/.env
N8N_ENCRYPTION_KEY=your-encryption-key
N8N_USER_MANAGEMENT_JWT_SECRET=your-jwt-secret
GENERIC_TIMEZONE=UTC
```

3. Start the services:
```bash
# Start n8n first
cd n8n
docker-compose up -d

# Start main application
cd ..
docker-compose up --build
```

4. Access the services:
- Chat Interface: http://localhost
- n8n Dashboard: http://localhost:5678

## 📁 Project Structure

```
.
├── src/
│   ├── components/
│   │   └── ChatUI.tsx      # Chat interface with session management
│   └── app/
│       └── page.tsx        # Main page component
├── n8n/
│   ├── .env               # n8n environment configuration
│   ├── docker-compose.yaml # n8n container orchestration
│   └── nginx/
│       └── conf.d/
│           └── default.conf # n8n nginx configuration
├── public/                # Static assets
├── nginx.conf            # Main nginx configuration
├── Dockerfile            # Frontend container build
├── docker-compose.yml    # Main container orchestration
└── next.config.ts        # Next.js configuration
```

## 🔧 Configuration

### n8n Setup (n8n/docker-compose.yaml)
```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_DIAGNOSTICS_ENABLED=false
      - N8N_PERSONALIZATION_ENABLED=false
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - N8N_USER_MANAGEMENT_JWT_SECRET=${N8N_USER_MANAGEMENT_JWT_SECRET}
      - N8N_PORT=5678
    volumes:
      - n8n_storage:/home/node/.n8n
      - ./shared:/data/shared

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
```

### n8n Nginx Configuration (n8n/nginx/conf.d/default.conf)
```nginx
server {
    listen 80;
    
    location / {
        proxy_pass http://n8n:5678;
        proxy_set_header Host $host;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Main Application Configuration (docker-compose.yml)
```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - WATCHPACK_POLLING=true

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
```

## 🔍 Troubleshooting

### Common Issues

1. **n8n Connection Issues**
   - Verify n8n container is running: `cd n8n && docker-compose ps`
   - Check n8n logs: `docker-compose logs n8n`
   - Verify n8n nginx configuration
   - Check n8n environment variables

2. **Frontend Issues**
   - Check main application logs: `docker-compose logs frontend`
   - Verify nginx configuration
   - Check browser console for errors

3. **Webhook Issues**
   - Verify webhook URL in ChatUI component matches n8n setup
   - Check n8n workflow configuration
   - Monitor network requests in browser dev tools

### Health Checks
```bash
# Check n8n services
cd n8n
docker-compose ps
docker-compose logs -f

# Check main application
cd ..
docker-compose ps
docker-compose logs -f
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
