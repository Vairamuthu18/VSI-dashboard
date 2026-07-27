# AI Visibility Dashboard

A comprehensive dashboard to track brand performance across AI platforms (ChatGPT, Perplexity, Claude, Gemini) with Google Search Console and GA4 integration.

## Features
- **Share of Model (SoM)**: Track your brand's presence in AI responses.
- **Sentiment Analysis**: Monitor how AI portrays your brand.
- **Win/Loss Analysis**: See where you rank vs. competitors.
- **Competitor Gap Analysis**: Identify prompts where competitors are mentioned but you aren't.
- **Revenue Impact**: Correlate AI mentions with direct traffic and conversions (GA4).
- **Technical Health**: Track Schema validation and bot crawl activity.

## Setup Instructions

### Prerequisites
- PHP 8.0 or higher
- Web server (Apache, Nginx, or PHP built-in server)
- Composer (for Google API dependencies, optional if not syncing)

### Installation
1.  **Clone/Download** the repository.
2.  **Permissions**: Ensure the `data/` directory is writable by your web server.
    ```bash
    chmod -R 777 data/
    ```
3.  **Google Integration (Optional)**:
    -   To enable auto-sync with GSC and GA4, place your `google-credentials.json` in the `credentials/` folder.
    -   Create a `.env` file in `credentials/` based on the example below.
    -   Run `composer install` to install Google API clients (you may need to create a `composer.json` first if one is not provided, or simply rely on manual data entry/sample data).

### Running the Dashboard
You can use the built-in PHP server for testing:

```bash
cd ai-visibility-dashboard
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Project Structure
- `data/`: JSON data files (Database).
- `php/`: Backend API and Sync logic.
- `js/`: Dashboard logic and Chart.js configuration.
- `css/`: Styling and Theme.

## Configuration
Edit `php/config.php` for general settings.

## Data Management
- Data is stored in JSON files in the `data/` directory.
- You can manually edit these files or use the dashboard's Sync features (requires API credentials).

## JSON Data Structure
- `prompts.json`: List of queries you are tracking.
- `ai_responses.json`: The raw results from your AI monitoring.
- `competitors.json`: Competitor metadata.
