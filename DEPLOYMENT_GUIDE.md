# DriveCare PRO — Server Deployment & Multi-Device Access Guide

This guide explains how to run the project on **other laptops, mobile phones, or deploy it permanently to a 24/7 cloud server** with a public URL!

---

## 🚀 Option 1: Access from Another Laptop or Phone Right Now (Local Network / Wi-Fi)

Your laptop is configured as the host server (`0.0.0.0:5000`).

### 📱 Your Shared Network URL:
```
http://10.250.2.144:5000
```

### How to use:
1. Make sure your laptop and the other laptop/phone are connected to the **same Wi-Fi network or Mobile Hotspot**.
2. Keep your backend running on your laptop (`npm start` in `backend/`).
3. On the other laptop or smartphone, open any web browser (Chrome, Edge, Safari) and visit:
   ```
   http://10.250.2.144:5000
   ```
4. **Done!** The full app will load instantly on their screen with full database connectivity, vehicle health diagnostics, and appointment booking!

> [!TIP]
> **If the other laptop cannot connect**: Windows Firewall might be blocking inbound port 5000. Run this command once in PowerShell (Run as Administrator):
> ```powershell
> netsh advfirewall firewall add rule name="DriveCare 5000" dir=in action=allow protocol=TCP localport=5000
> ```

---

## 🌍 Option 2: Deploy to a 24/7 Free Cloud Server (Render / Railway)

To make your project accessible to anyone in the world with a permanent HTTPS link (e.g., `https://drivecare-shiva.onrender.com`):

### Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up (Free).
2. Click **Create Cluster** $\rightarrow$ select **M0 Free Shared Tier**.
3. Under **Database Access**, create a user (e.g. `shiva` / password `Password123`).
4. Under **Network Access**, click **Add IP Address** $\rightarrow$ select **Allow Access from Anywhere (0.0.0.0/0)**.
5. Click **Connect** $\rightarrow$ **Drivers** $\rightarrow$ Copy your connection string:
   ```
   mongodb+srv://shiva:Password123@cluster0.xxxxx.mongodb.net/drivecare_db?retryWrites=true&w=majority
   ```

### Step 2: Push Your Code to GitHub
1. In `D:\2nd yr Odd_sem\DBMS\Project_DBMS`, open terminal:
   ```bash
   git init
   git add .
   git commit -m "DriveCare PRO Full Stack System"
   git remote add origin https://github.com/<your-username>/drivecare-project.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Render (Free Web Service)
1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select your `drivecare-project` repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `MONGO_URI` = *(paste your MongoDB Atlas connection string)*
   - `JWT_SECRET` = `drivecare_secret_key_2026_klh_cs_supersecure`
   - `NODE_ENV` = `production`
6. Click **Deploy Web Service**.

Render will deploy your full-stack app and provide you with a permanent public link like:
```
https://drivecare-pro.onrender.com
```

---

## ⚡ Option 3: Instant Public Internet URL via Ngrok (No Cloud Database Needed)

If you want to demo the app over the internet right now from your laptop:
1. Download [ngrok](https://ngrok.com/download) or install via terminal:
   ```bash
   winget install ngrok
   ```
2. Run:
   ```bash
   ngrok http 5000
   ```
3. Ngrok will give you an instant public HTTPS URL:
   ```
   Forwarding   https://xxxx-xx-xx.ngrok-free.app -> http://localhost:5000
   ```
4. Send that URL to your teammates or professor, and they can open it from anywhere in the world!
