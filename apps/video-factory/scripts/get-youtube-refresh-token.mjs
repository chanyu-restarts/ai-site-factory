#!/usr/bin/env node
/**
 * One-time helper: fetch a YouTube Data API refresh token via OAuth2.
 *
 * Prerequisites (set in .env.local at repo root):
 *   YOUTUBE_CLIENT_ID=...
 *   YOUTUBE_CLIENT_SECRET=...
 *
 * Usage (from apps/video-factory):
 *   node --env-file=../../.env.local scripts/get-youtube-refresh-token.mjs
 *
 * The script will:
 *   1. Print an authorization URL — open it in a browser, sign in with the
 *      target Google account, accept the YouTube upload scope.
 *   2. Google redirects to http://localhost:8765 with ?code=... in the URL.
 *      The script intercepts this on a tiny local server.
 *   3. Exchanges the code for a refresh token and prints it.
 *   4. Copy the refresh token to .env.local as YOUTUBE_REFRESH_TOKEN.
 */

import { google } from "googleapis";
import http from "node:http";
import { URL } from "node:url";

const PORT = 8765;
const REDIRECT_URI = `http://localhost:${PORT}`;
const SCOPE = ["https://www.googleapis.com/auth/youtube.upload"];

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

const clientId = process.env.YOUTUBE_CLIENT_ID;
const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  fail(
    "Missing YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET in .env.local. See README for setup steps.",
  );
}

const oauth2 = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPE,
});

console.log("\n=== YouTube OAuth Refresh Token Helper ===\n");
console.log("1. Open this URL in your browser:\n");
console.log(`   ${authUrl}\n`);
console.log("2. Sign in with the Google account that owns the target YouTube channel.");
console.log("3. Accept the YouTube upload scope.");
console.log(`4. Google will redirect to ${REDIRECT_URI} (this script will catch it).\n`);
console.log("Listening for callback...\n");

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, REDIRECT_URI);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end(`OAuth error: ${error}`);
      fail(`OAuth flow failed: ${error}`);
      return;
    }

    if (!code) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("No authorization code received.");
      return;
    }

    const { tokens } = await oauth2.getToken(code);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
      <html><body style="font-family: sans-serif; padding: 40px;">
        <h2>Success</h2>
        <p>Refresh token captured. Return to your terminal.</p>
      </body></html>
    `);

    console.log("\n=== SUCCESS ===\n");
    if (!tokens.refresh_token) {
      console.warn(
        "No refresh token returned. This usually means the account already authorized this client. To force a new refresh token, revoke at https://myaccount.google.com/permissions and rerun.",
      );
    } else {
      console.log("Add this line to your .env.local at the repo root:\n");
      console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    }

    server.close();
    process.exit(0);
  } catch (err) {
    console.error("Failed to exchange code:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal error. See terminal for details.");
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  // ready
});
