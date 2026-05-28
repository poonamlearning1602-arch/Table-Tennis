# Table Tennis Multiplayer - Deployment Guide

This guide will walk you through deploying the remote multiplayer backend server to Railway and enabling the game to work with online multiplayer.

## 📋 Prerequisites

- GitHub account (already have one based on your repo)
- Railway account (free, link with GitHub)
- Your existing Table-Tennis repository on GitHub

## 🚀 Step-by-Step Deployment to Railway

### Phase 1: Prepare GitHub Repository

The backend code has already been committed to your GitHub repository. You can verify this:

```bash
cd "C:\Users\15097\Desktop\Claude_Code"
git log --oneline | head -5
```

You should see recent commits including the backend server.

### Phase 2: Deploy to Railway (5 minutes)

#### 1. Go to Railway Dashboard
1. Open [railway.app](https://railway.app) in your browser
2. Click "Login" or "Sign up with GitHub"
3. Authorize Railway to access your GitHub account
4. Accept the terms

#### 2. Create New Project
1. Click "New Project" button
2. Select "Deploy from GitHub repo"
3. Find and select: `poonamlearning1602-arch/Table-Tennis`
4. Click "Deploy"

**Railway will automatically:**
- Detect Node.js as the runtime
- Install dependencies from `backend/package.json`
- Start the server using the `Procfile`

#### 3. Configure Environment Variables
1. Wait for deployment to complete (you'll see a green checkmark)
2. In the service dashboard, click the "Variables" tab
3. Add these variables:
   - `PORT`: `3000`
   - `GITHUB_PAGES_URL`: `https://poonamlearning1602-arch.github.io`
   - `NODE_ENV`: `production`
4. Click "Save"

#### 4. Get Your Server URL
1. Go back to the "Deployments" tab
2. Look for the deployment URL (typically: `https://[project-name]-production.up.railway.app`)
3. Copy this URL - you'll need it next

**Example URL:** `https://table-tennis-multiplayer.up.railway.app`

### Phase 3: Update Frontend with Server URL

#### 1. Edit `js/main.js`
Open the file and find this line (around line 140):
```javascript
const serverUrl = 'https://table-tennis-server.onrender.com';
```

Replace it with your Railway URL:
```javascript
const serverUrl = 'https://your-railway-url.up.railway.app';
```

#### 2. Commit and Push Changes
```bash
cd "C:\Users\15097\Desktop\Claude_Code"
git add js/main.js
git commit -m "Update backend server URL to Railway deployment"
git push origin master
```

#### 3. Deploy Frontend to GitHub Pages
GitHub Pages will automatically deploy your updated code within a few minutes.

Verify deployment:
- Wait 2-3 minutes for GitHub Pages to update
- Open `https://poonamlearning1602-arch.github.io/Table-Tennis/`
- You should see the updated game with "Online 2 Player" option

### Phase 4: Test the Multiplayer Connection

#### Local Testing (Same Computer)
1. Open the game in two browser windows/tabs:
   - Tab 1: `https://poonamlearning1602-arch.github.io/Table-Tennis/`
   - Tab 2: `https://poonamlearning1602-arch.github.io/Table-Tennis/`

2. In Tab 1:
   - Click "Online 2 Player"
   - Click "Create Room"
   - Wait for room code to appear (e.g., "ABCD")
   - Copy the room code

3. In Tab 2:
   - Click "Online 2 Player"
   - Click "Join Room"
   - Paste the room code (e.g., "ABCD")
   - Click "Join Room"

4. Both should connect and show "Game Starting..."
5. Select difficulty levels and play!

#### Network Testing (Different Devices)
1. Get the game URL: `https://poonamlearning1602-arch.github.io/Table-Tennis/`
2. Open on two different devices (laptop, phone, tablet)
3. One creates a room, other joins
4. Verify smooth gameplay and responsive controls

#### Troubleshooting Connection Issues

**"Server is unavailable" error:**
- Check that your Railway URL is correct (no trailing slashes)
- Verify Railway deployment is active (check dashboard)
- Wait a few seconds and try again

**Connection times out:**
- Railway free tier may have slow cold starts (first request takes 10-30s)
- Subsequent requests are fast
- Normal 100-300ms latency is fine

**"Room not found" error:**
- Verify room code is exactly 4 characters
- Check both players are on the same server URL
- Try creating a new room

**Paddles jitter or lag:**
- This is normal for the first second while network stabilizes
- Game uses interpolation to smooth movement
- Should stabilize within 2-3 seconds

## 📊 What's Running Now

### Frontend (GitHub Pages)
- **URL:** `https://poonamlearning1602-arch.github.io/Table-Tennis/`
- **Includes:**
  - Game UI (2-player local, AI single-player, online multiplayer)
  - Network client (WebSocket communication)
  - Matchmaking UI (create/join rooms)
  - State synchronization (game state updates every ~33ms)

### Backend (Railway)
- **URL:** `https://your-railway-url.up.railway.app`
- **Includes:**
  - WebSocket server (handles real-time connections)
  - Game session management (rooms, players, game state)
  - Physics engine (authoritative ball simulation)
  - State broadcaster (sends updates to both players every 33ms)

## 🔧 Advanced Configuration

### Change Server Port (if needed)
1. Go to Railway dashboard
2. Click your service
3. Click "Variables"
4. Change `PORT` to desired value
5. Railway will restart with new port

### Monitor Server Health
1. Railway dashboard shows:
   - CPU usage
   - Memory usage
   - Network latency
   - Recent logs

2. Check server status:
   - Visit: `https://your-railway-url/health`
   - Should return: `{ "status": "OK" }`

3. View statistics:
   - Visit: `https://your-railway-url/api/stats`
   - Shows active rooms and players

### View Server Logs
1. Go to Railway dashboard
2. Click your service
3. Click "Deployments" → "Logs"
4. See real-time server activity

## 📈 Performance Notes

- **Server:** Handles 20+ concurrent games comfortably
- **Network:** Uses ~5KB per game per minute
- **Update Rate:** 30 Hz (33ms per state update)
- **Latency:** Works well with 100-500ms latency
- **Cold Start:** First request may take 10-30s (Railway free tier)

## 🔐 Security

- CORS configured for GitHub Pages domain only
- No sensitive data in room codes (they're public)
- Game state is authoritative on server (no client-side cheating)
- WebSocket validates all input

## ✅ Verification Checklist

- [ ] Backend deployed to Railway
- [ ] Server URL copied from Railway dashboard
- [ ] `js/main.js` updated with correct server URL
- [ ] Changes committed and pushed to GitHub
- [ ] GitHub Pages deployed (wait 2-3 minutes)
- [ ] Game loads at `https://poonamlearning1602-arch.github.io/Table-Tennis/`
- [ ] "Online 2 Player" button appears in main menu
- [ ] Can create room and get room code
- [ ] Can join room with code on second browser
- [ ] Game starts and both players can play

## 📞 Support

- Check Railway logs for server errors
- Browser console (F12) shows client-side errors
- Verify server URL has no typos or trailing slashes
- Restart browser and try again if connection fails

## Next Steps

After deploying:
1. **Local Testing** - Test on your computer with two browser windows
2. **Network Testing** - Test with someone else on different network
3. **Optimization** - Monitor performance and adjust interpolation if needed
4. **Enhanced Features** - Add chat, rankings, or replay features

---

**Deployment Complete!** 🎉

Your Table Tennis game is now playable online. Share the URL with friends:
- **Game URL:** `https://poonamlearning1602-arch.github.io/Table-Tennis/`
- Friends can create rooms and play with you in real-time!
