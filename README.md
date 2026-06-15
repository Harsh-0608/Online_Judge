# CodePlex - Full-Stack Online Judge Platform

CodePlex is a premium, state-of-the-art web-based Online Judge platform. It supports user authentication, responsive dashboard panels, interactive coding challenge views with Monaco Editor theme selection, live standing lists, and automated evaluation of javascript, python, C++, and Java submissions.

---

## 🚀 Key Features

*   **Authentication & Security**: JWT-based sessions, secure bcrypt password hashing, and admin role enforcement.
*   **Multi-Language Sandbox & Concurrency Queue**: Safely compiles and executes JS, Python, C++, and Java submissions. Employs a bounded in-memory concurrency queue (customizable via `MAX_CONCURRENT_RUNS`) to prevent CPU/Memory starvation under concurrent load.
*   **Complexity & Naming Analysis**: Displays AI-based and offline fallback insights checking for optimal space/time efficiency, redundant loops, and descriptive variable names.
*   **Custom Input Drawer & Expected Verification**: Allows users to run custom inputs and dynamically compares them against database cases to render expected outputs (using a responsive 2-column or 3-column output layout).
*   **Contest Standings & Leaderboards**: Renders global rankings and contest performance metrics dynamically with no skips or duplicates.
*   **IDE Reset & Language Persistence**: Retains programming language preference globally across all challenges and supports editor templates reset.
*   **Premium Dark UI & Micro-animations**: Visually stunning dark mode interface with glassmorphic modals, custom sliders, and completion badges (checkmark indicators).
*   **Production Docker Setup**: Complete container orchestration setup with automated Certbot SSL and secure Nginx routing.

---

## 📦 Project Architecture

```
                       +----------------------------------------+
                       |              Browser (Client)          |
                       +----------------------------------------+
                                           |
                                           | HTTP Requests / static assets
                                           v
                       +----------------------------------------+
                       |       Nginx Reverse Proxy / Static     | [Frontend Container: 80]
                       +----------------------------------------+
                               |                        |
             static files (/)  v                        v  proxy (/api/*)
                       [React Static]           +-----------------------+
                                                |     Node.js API       | [Backend Container: 5000]
                                                +-----------------------+
                                                            |
                                           executes sandbox | database reads/writes
                                           locally          v
                                                +-----------------------+
                                                |       MongoDB         | [Database Container: 27017]
                                                +-----------------------+
```

---

## 🛠️ Local Quickstart

### Method A: Running with Docker Compose (Recommended)
Make sure you have [Docker](https://www.docker.com/) installed on your machine.

1.  **Clone the repository and navigate to the project directory**:
    ```bash
    cd "Online Judge"
    ```
2.  **Spin up the entire stack**:
    ```bash
    docker compose up --build -d
    ```
3.  **Seed the Database**:
    Once the backend container is running, seed the initial problems and contests database:
    ```bash
    docker exec -it codeplex-backend node scripts/seedProblems.js
    ```
4.  **Access the Platform**:
    Open [http://localhost](http://localhost) in your browser.

---

### Method B: Running Services Manually

#### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with details:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/online-judge
   JWT_SECRET=supersecretjwtkey123!@#
   JWT_EXPIRES_IN=7d
   ```
4. Seed the database:
   ```bash
   node scripts/seedProblems.js
   ```
5. Run the dev gateway server:
   ```bash
   npm run dev
   ```

#### 2. Setup Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch Vite Dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ AWS Deployment Walkthrough (Detailed Guide)

Follow this complete step-by-step walkthrough to deploy CodePlex to a production AWS EC2 server, bind a custom domain, and secure it with Let's Encrypt SSL.

### Phase 1: Launch an AWS EC2 Instance
1.  Log into your **AWS Management Console**.
2.  Navigate to **EC2** and click **Launch Instance**.
3.  **Configuration Settings**:
    *   **Name**: `codeplex-production`
    *   **OS (AMI)**: Select **Ubuntu 22.04 LTS** (eligible for Free Tier).
    *   **Instance Type**: `t2.micro` (or `t3.micro` depending on region availability).
    *   **Key Pair**: Create or select an existing `.pem` key pair for SSH access.
4.  **Network Settings (Security Group)**:
    Create a security group and add the following inbound rules:
    *   `Port 22 (SSH)` -> Source: `Anywhere (0.0.0.0/0)` or `My IP`.
    *   `Port 80 (HTTP)` -> Source: `Anywhere (0.0.0.0/0)`
    *   `Port 443 (HTTPS)` -> Source: `Anywhere (0.0.0.0/0)`
5.  Click **Launch Instance**. Copy the public IPv4 address of your instance (e.g., `54.210.45.182`).

---

### Phase 2: Setup Domain Name (GitHub Student Pack)
To enable HTTPS, you need a custom domain name.
1.  Go to the [GitHub Student Developer Pack](https://education.github.com/pack) and register for standard benefits.
2.  Claim a free domain from one of the partner registers (e.g., **Namecheap** or **Name.com**).
3.  Log into your domain registrar dashboard.
4.  Add an **A Record** pointing to your AWS EC2 instance public IP:
    *   **Host**: `@` (or leave blank) -> **Value**: `54.210.45.182` (your EC2 IP)
    *   **Host**: `www` -> **Value**: `54.210.45.182`
5.  Wait a few minutes for DNS propagation (you can test this by running `nslookup yourdomain.com` in your terminal).

---

### Phase 3: Install Docker and Docker Compose on EC2
1.  Connect to your EC2 instance via SSH:
    ```bash
    ssh -i "your-key.pem" ubuntu@54.210.45.182
    ```
2.  Update Ubuntu packages:
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
3.  Install Docker:
    ```bash
    sudo apt install docker.io -y
    ```
4.  Start and enable Docker daemon:
    ```bash
    sudo systemctl start docker
    ```
    ```bash
    sudo systemctl enable docker
    ```
5.  Add the `ubuntu` user to the docker group so you don't need `sudo` for every command:
    ```bash
    sudo usermod -aG docker ubuntu
    ```
    *(Note: Run `newgrp docker` or log out and log back in to apply this group membership change).*
6.  Install Docker Compose v2:
    ```bash
    sudo apt install docker-compose-v2 -y
    ```

---

### Phase 4: Deploy CodePlex on EC2
1.  Clone your code repository to the instance:
    ```bash
    git clone https://github.com/your-username/online-judge.git
    cd online-judge
    ```
2.  Create your production database and app configurations using Docker Compose:
    ```bash
    docker compose up --build -d
    ```
3.  Once the build completes and containers start, run the DB seeder script:
    ```bash
    docker exec -it codeplex-backend node scripts/seedProblems.js
    ```
4.  Open your browser and navigate to `http://yourdomain.com`. Your application should load!

---

### Phase 5: Enable SSL (HTTPS) with Let's Encrypt Certbot
To secure passwords and code runs, we will configure SSL.

1.  SSH into your instance and install **Certbot** for Nginx:
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    ```
2.  Since Nginx is running inside our Docker container, we temporarily stop the frontend container to release port `80` so Certbot can run its verification check:
    ```bash
    docker stop codeplex-frontend
    ```
3.  Request the SSL certificate using Certbot's standalone server:
    ```bash
    sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
    ```
    *Enter your email address and accept terms when prompted.*
4.  Your certificates will be generated and saved at `/etc/letsencrypt/live/yourdomain.com/`.

#### Map SSL Certificates into Docker Frontend Container
We will mount these certificates into the frontend container and update Nginx to listen on port `443` (HTTPS).

1.  Create an Nginx configuration file for production: `frontend/nginx.prod.conf`
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$host$request_uri; # Redirect HTTP traffic to HTTPS
    }

    server {
        listen 443 ssl;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:5000/api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    *(Remember to replace `yourdomain.com` with your actual domain).*

2.  Update `docker-compose.yml` to support port 443 and map the cert volumes:
    ```yaml
    version: '3.8'

    services:
      mongodb:
        image: mongo:latest
        container_name: codeplex-db
        restart: always
        volumes:
          - mongodb_data:/data/db

      backend:
        build:
          context: ./backend
          dockerfile: Dockerfile
        container_name: codeplex-backend
        restart: always
        depends_on:
          - mongodb
        environment:
          - PORT=5000
          - MONGO_URI=mongodb://mongodb:27017/online-judge
          - JWT_SECRET=supersecretjwtkey123!@#
          - JWT_EXPIRES_IN=7d

      frontend:
        build:
          context: ./frontend
          dockerfile: Dockerfile
        # Override standard Dockerfile CMD to use our production config
        volumes:
          - ./frontend/nginx.prod.conf:/etc/nginx/conf.d/default.conf
          - /etc/letsencrypt/live/yourdomain.com/fullchain.pem:/etc/nginx/certs/fullchain.pem:ro
          - /etc/letsencrypt/live/yourdomain.com/privkey.pem:/etc/nginx/certs/privkey.pem:ro
        container_name: codeplex-frontend
        restart: always
        ports:
          - "80:80"
          - "443:443"
        depends_on:
          - backend

    volumes:
      mongodb_data:
    ```

3.  Restart Docker Compose in production mode:
    ```bash
    docker compose down
    docker compose up --build -d
    ```

Now, your application is fully secure and accessible under `https://yourdomain.com`!

---

## 📝 Submission Reports
For reporting status in your Discord team groups:
```text
Compiler + <basic/user-input/testcases> + Docker + AWS
```
Link: `https://yourdomain.com` (Your deployed domain)
