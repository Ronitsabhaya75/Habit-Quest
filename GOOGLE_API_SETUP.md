# Google Sheets API Setup

## Overview
The review submission feature in this application requires a Google Sheets API key to function properly. This document will guide you through the process of setting up and configuring this API key.

## Steps to Create and Configure Google Sheets API Key

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project or Select an Existing One**
   - Click on the project dropdown at the top of the page
   - Select "New Project" or choose an existing project

3. **Enable the Google Sheets API**
   - In the left sidebar, navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

4. **Create API Credentials**
   - In the left sidebar, navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" and select "API key"
   - Your new API key will be displayed

5. **Restrict Your API Key (Recommended)**
   - After creating the key, click "Restrict Key"
   - Under "API restrictions", select "Google Sheets API"
   - Save the changes

6. **Add to Environment Variables**
   - Create a `.env.local` file in the root of your project if it doesn't exist
   - Add the following line:
     ```
     GOOGLE_SHEETS_API_KEY=your_api_key_here
     ```
   - Replace `your_api_key_here` with the API key you created

7. **Restart Your Development Server**
   - If your server is running, restart it to load the new environment variables

## Troubleshooting

If you encounter errors related to the Google Sheets API:

- Verify that the API key is correctly added to your `.env.local` file
- Ensure the Google Sheets API is enabled for your project
- Check that your API key has the necessary permissions
- Verify that the spreadsheet you're trying to access is shared with the appropriate Google account

## Security Notes

- Never commit your `.env.local` file to version control
- Consider using API key restrictions to enhance security
- Regularly rotate your API keys as a security best practice 