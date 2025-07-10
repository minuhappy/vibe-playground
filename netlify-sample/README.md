# Netlify Scheduled Function Sample

This project demonstrates how to use Netlify Functions with a scheduled (cron) trigger.

## Features
- Scheduled Netlify Function (`scheduled-task`) runs every 5 minutes.
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
   - The scheduled function will run automatically according to the schedule in `netlify.toml`.

## File Structure

- `netlify/functions/scheduled-task.js`: The scheduled function code.
- `netlify.toml`: Netlify configuration, including the schedule.
- `package.json`: Project dependencies and scripts.

## Customizing the Schedule

Edit the `schedule` field in `netlify.toml` to change how often the function runs. Uses [cron syntax](https://crontab.guru/). 