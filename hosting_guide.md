# Domain Setup & Hosting Guide

Your Online Judge website is successfully running on the remote server at **`13.239.63.88`**. The Nginx configuration inside Docker is configured to respond to any hostname pointing to it. 

Here are the detailed steps to set up a domain name for your website completely for free.

---

## Option A: Easiest & Instant (Using DuckDNS)
If you want a free domain working **instantly** (within 2 minutes) without waiting for student verification approvals, you can get a free subdomain from **DuckDNS**:

1. Go to the [DuckDNS Website](https://www.duckdns.org/).
2. Log in using your Google, GitHub, or Reddit account.
3. In the **domains** section, type your preferred domain name (e.g., `codeplex-judge`) and click **Add Domain**.
4. In the box next to your new domain, enter your server's IP address: **`13.239.63.88`**.
5. Click **Update IP**.
6. That's it! You can now visit your website at **`http://yourdomain.duckdns.org`** (e.g. `http://codeplex-judge.duckdns.org`).

---

## Option B: Using the GitHub Student Developer Pack
If you want a custom domain (like `.me`, `.tech`, or `.live`) for free:

### 1. Registering the Domain
1. Log in to [GitHub Education benefits portal](https://education.github.com/pack).
2. Browse the pack benefits and look for a domain registrar offer:
   * **Namecheap:** Offers a free `.me` domain name for 1 year.
   * **Name.com:** Offers a free domain registration (like `.tech`, `.live`, `.me`) for 1 year.
3. Click the referral link on GitHub to go to the registrar's website and sign in using your GitHub student account.
4. Search for your domain name (e.g., `codeplex-judge.me`), add it to the cart (it should be discounted to $0), and finish the checkout.

### 2. Pointing your Domain to the Server (`13.239.63.88`)
Once registered, you need to point the domain's DNS records to your EC2 instance:
1. Go to your registrar's control panel (e.g. Namecheap Dashboard / Name.com Domain List).
2. Select your domain and go to **Advanced DNS** or **DNS Settings**.
3. Clear out any default placeholder records (like parking pages).
4. Add the following **two** DNS records:
   
   | Type | Host / Name | Value / Target | TTL | Purpose |
   | :--- | :--- | :--- | :--- | :--- |
   | **A Record** | `@` | `13.239.63.88` | Automatic / 30m | Points your root domain (e.g. `yourdomain.me`) to the server |
   | **CNAME** | `www` | `yourdomain.me` | Automatic / 30m | Redirects `www.yourdomain.me` to your root domain |

5. Save the records.
   > [!NOTE]
   > DNS updates can take 15 minutes to a few hours to propagate globally. You can check the progress on [DNSChecker](https://dnschecker.org/).

---

## Option C: Setting up Free SSL (HTTPS) with Certbot
Once your domain points to the server and is working via `http://`, you can add lock-icon security (SSL/HTTPS) using Certbot/Let's Encrypt for free:

1. SSH into your remote server:
   ```bash
   ssh -i "C:\Users\harsh\Downloads\codeplex-key.pem" ubuntu@13.239.63.88
   ```
2. Install Certbot on the host:
   ```bash
   sudo apt-get update
   sudo apt-get install -y certbot
   ```
3. Request your SSL certificate (replace `yourdomain.me` with your actual domain):
   ```bash
   sudo certbot certonly --standalone -d yourdomain.me -d www.yourdomain.me
   ```
4. Move or link the certificates to the directory where your Docker container expects them (usually `/etc/nginx/certs` or as configured in `docker-compose.yml`), or adjust the port mappings.
