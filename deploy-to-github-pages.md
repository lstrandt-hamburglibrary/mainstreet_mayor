# Deploy Main Street Mayor to GitHub Pages

## Steps:

1. Create a GitHub account at https://github.com if you don't have one

2. Create a new repository called "mainstreet-mayor"

3. In your terminal, run these commands:

```bash
cd /Users/short/dev/mainstreet_mayor_phaser

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Main Street Mayor game"

# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/mainstreet-mayor.git

# Push to GitHub
git branch -M main
git push -u origin main
```

4. In GitHub, go to Settings → Pages
5. Under "Source", select "main" branch
6. Click Save

Your game will be live at: https://YOUR_USERNAME.github.io/mainstreet-mayor/

## Advantages:
- FREE forever
- Permanent URL
- No server needed
- Automatic updates when you push changes
- Works from any device

