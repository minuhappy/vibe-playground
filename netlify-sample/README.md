# Netlify Scheduled Function Sample

This project demonstrates how to use Netlify Functions with scheduled (cron) triggers.

## Features
- Scheduled Netlify Function (`scheduled-task`) runs every 5 minutes.
- News monitoring function (`news-monitor`) runs every 2 hours to fetch Google News RSS feeds.
- Logs the current time when triggered.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run locally with Netlify CLI**
   ```bash
   npm start
   ```
   > Requires [Netlify CLI](https://docs.netlify.com/cli/get-started/) (`netlify-cli` is included as a dev dependency).

3. **Deploy to Netlify**
   - Push this project to your Git repository and connect it to Netlify.
   - The scheduled functions will run automatically according to the schedule in `netlify.toml`.

## File Structure

- `netlify/functions/scheduled-task.js`: Basic scheduled function that logs time.
- `netlify/functions/news-monitor.js`: News monitoring function that fetches Google News RSS feeds.
- `netlify.toml`: Netlify configuration, including the schedules.
- `package.json`: Project dependencies and scripts.

## Functions

### scheduled-task
- **Schedule**: Every 5 minutes (`*/5 * * * *`)
- **Purpose**: Basic logging function
- **Local test**: `http://localhost:8888/.netlify/functions/scheduled-task`

### news-monitor
- **Schedule**: Every 2 hours (`0 */2 * * *`)
- **Purpose**: Fetches news from Google News RSS for configured keywords
- **Keywords**: AI, artificial intelligence, machine learning
- **Local test**: `http://localhost:8888/.netlify/functions/news-monitor`

## Customizing the Schedule

Edit the `schedule` field in `netlify.toml` to change how often the functions run. Uses [cron syntax](https://crontab.guru/).

## Customizing Keywords

Edit the `KEYWORDS` array in `netlify/functions/news-monitor.js` to monitor different keywords. 