
# Country Flag Live — YouTube Chat Points

This is a working starter project for a YouTube Live country leaderboard.

WHAT IT DOES
- Reads your active YouTube Live Chat through the YouTube Data API.
- If a viewer writes a supported country name, that country gets +1.
- The viewer's display name appears in a floating notification.
- A $1 Super Chat adds 1,000 points (based on the currency amount returned by YouTube).
- The leaderboard automatically reorders by score.
- Includes a phone-friendly 9:16-style overlay.

IMPORTANT
This is not possible with a standalone HTML file alone. A small Node.js server is included because the server keeps your API key out of the webpage and polls YouTube.

SETUP
1. Install Node.js 18+ on a computer/cloud service.
2. In Google Cloud Console, create a project and enable "YouTube Data API v3".
3. Create an API key. Restrict it to YouTube Data API v3 if possible.
4. Find your YouTube LIVE VIDEO ID (the part after v= in the live video's URL).
5. Set environment variables:
   YOUTUBE_API_KEY=YOUR_KEY
   YOUTUBE_VIDEO_ID=YOUR_LIVE_VIDEO_ID
6. Run:
   npm install
   npm start
7. Open http://localhost:3000

PHONE USE
For your Samsung A13, the easiest practical route is to deploy this small Node app to a cloud host that supports Node (for example Render/Railway/Replit or another Node host), then open the resulting webpage on your phone. You can screen-share that webpage into your YouTube Live.

SECURITY
Do not paste your API key into index.html. Keep it in the server environment variables and restrict the key in Google Cloud.

SUPPORTED EXAMPLES
Bangladesh, India, Pakistan, Nepal, Bhutan, Sri Lanka, Thailand, Vietnam, Indonesia, Malaysia, Philippines, Brazil, United States, Japan, South Korea, China, Russia, Germany, France, Italy, Spain, Portugal, Canada, Australia, New Zealand, Mexico, Turkey, Iran, Iraq, Qatar, Saudi Arabia, UAE, Egypt, Morocco, Albania, Kosovo, Greece, Norway, Sweden, Finland, Denmark, Poland, Ukraine, Romania, South Africa, Nigeria, Ghana, Kenya, Argentina, Chile, Colombia, Peru, Uruguay.

TEST MODE
Before connecting YouTube, type a viewer name and a country in the bottom test box. It will simulate a +1 event.

NOTE
The exact screenshot you supplied contains platform UI and custom graphics. This project recreates the functional leaderboard concept and visual structure rather than copying the other channel's branding/assets.
