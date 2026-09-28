const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const requireAuth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();
const supportedPlatforms = ["Instagram", "Facebook", "LinkedIn", "X", "YouTube", "Google Business"];

function envValue(name) {
  return process.env[name]?.trim();
}

function normalizeGoogleLocationName(locationName, accountName) {
  if (!locationName) return "";
  if (locationName.startsWith("accounts/")) return locationName;
  if (locationName.startsWith("locations/") && accountName) {
    return `${accountName}/${locationName}`;
  }
  return locationName;
}

function selectGoogleLocation(locations) {
  const configuredStoreCode = envValue("GOOGLE_BUSINESS_STORE_CODE")?.replace(/\s+/g, "");
  if (!configuredStoreCode) return locations[0];
  return locations.find((location) => (
    location.storeCode === configuredStoreCode
    || location.name.endsWith(`/locations/${configuredStoreCode}`)
    || location.title.toLowerCase() === "digital alife pvt. ltd."
  ));
}

function getClientUrl() {
  return (process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim().replace(/\/$/, "");
}

function getRedirectUri(platform) {
  const configuredRedirects = {
    Facebook: process.env.META_REDIRECT_URI,
    Instagram: process.env.META_REDIRECT_URI,
    LinkedIn: process.env.LINKEDIN_REDIRECT_URI,
    X: process.env.X_REDIRECT_URI,
    YouTube: process.env.YOUTUBE_REDIRECT_URI,
    "Google Business": envValue("GOOGLE_BUSINESS_REDIRECT_URI"),
  };
  if (configuredRedirects[platform]) return configuredRedirects[platform].trim();
  const baseUrl = (process.env.BACKEND_PUBLIC_URL || process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");
  return `${baseUrl}/api/social-app/social/callback/${platform.toLowerCase()}`;
}

function configFor(platform) {
  const graphVersion = process.env.META_GRAPH_VERSION || "v23.0";
  const configs = {
    Facebook: {
      clientId: process.env.META_APP_ID || process.env.META_CLIENT_ID,
      clientSecret: process.env.META_APP_SECRET || process.env.META_CLIENT_SECRET,
      authorizeUrl: `https://www.facebook.com/${graphVersion}/dialog/oauth`,
      tokenUrl: `https://graph.facebook.com/${graphVersion}/oauth/access_token`,
      scopes: "pages_show_list,pages_read_engagement,pages_read_user_content,pages_manage_posts,pages_manage_metadata,pages_manage_engagement",
    },
    Instagram: {
      clientId: process.env.META_APP_ID || process.env.META_CLIENT_ID,
      clientSecret: process.env.META_APP_SECRET || process.env.META_CLIENT_SECRET,
      authorizeUrl: `https://www.facebook.com/${graphVersion}/dialog/oauth`,
      tokenUrl: `https://graph.facebook.com/${graphVersion}/oauth/access_token`,
      scopes: "pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata,instagram_basic,instagram_content_publish,instagram_manage_comments",
    },
    LinkedIn: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
      tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
      scopes: "openid profile email w_member_social",
    },
    X: {
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
      authorizeUrl: "https://twitter.com/i/oauth2/authorize",
      tokenUrl: "https://api.twitter.com/2/oauth2/token",
      scopes: "tweet.read tweet.write users.read offline.access",
    },
    YouTube: {
      clientId: process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/yt-analytics.readonly",
    },
    "Google Business": {
      clientId: envValue("GOOGLE_BUSINESS_CLIENT_ID"),
      clientSecret: envValue("GOOGLE_BUSINESS_CLIENT_SECRET"),
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: "https://www.googleapis.com/auth/business.manage",
    },
  };
  return configs[platform];
}

function createState(platform, userId, codeVerifier, tenantId) {
  return jwt.sign(
    { platform, userId, codeVerifier, tenantId: tenantId ? String(tenantId) : null },
    process.env.JWT_SECRET,
    { expiresIn: "10m" },
  );
}

function callbackError(message) {
  return `${getClientUrl()}/admin/dashboard?social_error=${encodeURIComponent(message)}#social-accounts`;
}

function getProviderErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error.error_description) return error.error_description;
  if (error.message) return error.message;
  if (error.error) return getProviderErrorMessage(error.error, fallback);
  return fallback;
}

async function exchangeCode(platform, config, code, state) {
  const params = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: getRedirectUri(platform),
  });
  if (platform === "X" && state.codeVerifier) {
    params.set("code_verifier", state.codeVerifier);
  }

  const isMeta = platform === "Facebook" || platform === "Instagram";
  const tokenResponse = isMeta
    ? await fetch(`${config.tokenUrl}?${params}`)
    : await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(platform === "X"
          ? {
            Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
          }
          : {}),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        ...(platform === "X"
          ? {
            code: params.get("code"),
            redirect_uri: params.get("redirect_uri"),
            code_verifier: params.get("code_verifier") || "",
          }
          : Object.fromEntries(params)),
      }),
    });
  const tokenData = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenData.access_token) {
    if (
      platform === "Google Business"
      && tokenData.error === "invalid_client"
    ) {
      throw new Error(
        "Google Business OAuth client secret is invalid. Use the secret generated for the same OAuth client ID, update GOOGLE_BUSINESS_CLIENT_SECRET, and restart the backend.",
      );
    }
    throw new Error(getProviderErrorMessage(
      tokenData,
      `The ${platform} platform rejected the authorization code`,
    ));
  }
  return tokenData;
}

async function fetchProfile(platform, accessToken) {
  if (platform === "Instagram") {
    const graphVersion = process.env.META_GRAPH_VERSION || "v23.0";
    const response = await fetch(
      `https://graph.facebook.com/${graphVersion}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Meta could not verify your Instagram permissions");
    }
    const page = data.data?.find((item) => item.instagram_business_account?.id);
    if (!page) {
      throw new Error("No Instagram Business or Creator account is connected to a Facebook Page");
    }
    const instagram = page.instagram_business_account;
    return {
      id: instagram.id,
      handle: instagram.username ? `@${instagram.username}` : "Instagram account",
      providerData: { pageId: page.id, pageName: page.name, pageAccessToken: page.access_token || accessToken },
      accessToken,
    };
  }

  if (platform === "LinkedIn") {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "LinkedIn did not return your profile");
    return { id: data.sub, handle: data.name || data.email || "LinkedIn account" };
  }

  if (platform === "X") {
    const response = await fetch("https://api.twitter.com/2/users/me?user.fields=name,username", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (!response.ok || !data.data) throw new Error(data.detail || "X did not return your profile");
    return { id: data.data.id, handle: `@${data.data.username}` };
  }

  if (platform === "YouTube") {
    const response = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (!response.ok || !data.items?.[0]) throw new Error(data.error?.message || "No YouTube channel was found for this account");
    return { id: data.items[0].id, handle: data.items[0].snippet.title };
  }

  if (platform === "Google Business") {
    const response = await fetch("https://mybusinessbusinessinformation.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (!response.ok || !data.accounts?.[0]) {
      throw new Error(data.error?.message || "No Google Business Profile account was found");
    }
    const account = data.accounts[0];
    const locationsResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storeCode`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const locationsData = await locationsResponse.json().catch(() => ({}));
    const locations = (locationsData.locations || []).map((location) => ({
      name: normalizeGoogleLocationName(location.name, account.name),
      title: location.title || "Google Business location",
      storeCode: location.storeCode || "",
    }));
    const selectedLocation = selectGoogleLocation(locations);
    if (!selectedLocation) {
      throw new Error(
        `Google Business store code ${envValue("GOOGLE_BUSINESS_STORE_CODE")} was not found. Check the store code in Backend/.env.`,
      );
    }
    return {
      id: account.name,
      handle: account.accountName || "Google Business Profile",
      providerData: {
        accountName: account.name,
        locations,
        locationName: selectedLocation.name,
        locationTitle: selectedLocation.title,
        storeCode: selectedLocation.storeCode,
      },
    };
  }

  const graphVersion = process.env.META_GRAPH_VERSION || "v23.0";
  const response = await fetch(`https://graph.facebook.com/${graphVersion}/me/accounts?fields=id,name,access_token`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  if (!response.ok || !data.data?.[0]) throw new Error(data.error?.message || "No Facebook Page was found for this account");
  const page = data.data[0];
  return {
    id: page.id,
    handle: page.name || `${platform} account`,
    providerData: { pageId: page.id, pageName: page.name, pageAccessToken: page.access_token || accessToken },
    accessToken: page.access_token || accessToken,
  };
}

router.get("/accounts", requireAuth, async (request, response, next) => {
  try {
    const user = await User.findOne({
      _id: request.user._id,
      ...(request.tenantId ? { tenantId: request.tenantId } : {}),
    })
      .select("+socialAccounts.accessToken +socialAccounts.refreshToken");
    response.json({
      success: true,
      accounts: (user.socialAccounts || []).map((account) => ({
        id: `${account.platform}-${account.providerAccountId}`,
        name: account.platform,
        handle: account.handle,
        connected: true,
        connectedAt: account.connectedAt,
        providerData: account.providerData,
        needsReconnect: account.platform === "Google Business"
          && !account.refreshToken,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/connect/:platform", requireAuth, (request, response) => {
  const platform = supportedPlatforms.find((item) => item.toLowerCase() === request.params.platform.toLowerCase());
  if (!platform) return response.status(400).json({ success: false, message: "This social platform is not supported" });

  const config = configFor(platform);
  if (!config?.clientId || !config.clientSecret) {
    return response.status(503).json({
      success: false,
      message: `${platform} connection is not configured yet. Add its OAuth client ID and secret to the backend environment.`,
    });
  }

  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  const query = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: getRedirectUri(platform),
    response_type: "code",
    scope: config.scopes,
    state: createState(platform, request.user._id.toString(), codeVerifier, request.tenantId),
  });
  if (platform === "X") query.set("code_challenge", codeChallenge), query.set("code_challenge_method", "S256");
  if (platform === "YouTube" || platform === "Google Business") {
    query.set("access_type", "offline");
    query.set("prompt", "consent");
    query.set("include_granted_scopes", "true");
  }
  response.json({ success: true, authorizationUrl: `${config.authorizeUrl}?${query}` });
});

async function handleCallback(request, response, callbackPlatform) {
  try {
    if (request.query.error) {
      return response.redirect(callbackError(request.query.error_description || "Authorization was cancelled"));
    }
    if (!request.query.state) {
      throw new Error("Meta callback did not include a valid state parameter. Restart the connection from the app.");
    }
    if (!request.query.code) {
      throw new Error("Meta callback did not include an authorization code. The authorization was not completed.");
    }
    const state = jwt.verify(request.query.state, process.env.JWT_SECRET);
    if (
      request.tenantId &&
      (!state.tenantId || String(state.tenantId) !== String(request.tenantId))
    ) {
      throw new Error("The social connection belongs to a different tenant.");
    }
    const platform = callbackPlatform || (request.params.platform
      ? supportedPlatforms.find((item) => item.toLowerCase() === request.params.platform.toLowerCase())
      : state.platform);
    if (!platform || state.platform !== platform) throw new Error("Invalid social connection callback");

    const config = configFor(platform);
    const tokenData = await exchangeCode(platform, config, request.query.code, state);
    const profile = await fetchProfile(platform, tokenData.access_token);
    const user = await User.findOne({
      _id: state.userId,
      ...(request.tenantId ? { tenantId: request.tenantId } : {}),
    }).select("+socialAccounts.accessToken +socialAccounts.refreshToken");
    if (!user) throw new Error("Your user account could not be found");

    const existingAccount = (user.socialAccounts || []).find(
      (account) => account.platform === platform && account.providerAccountId === profile.id,
    );
    const refreshToken = tokenData.refresh_token || existingAccount?.refreshToken;

    user.socialAccounts = (user.socialAccounts || []).filter(
      (account) => !(account.platform === platform && account.providerAccountId === profile.id),
    );
    user.socialAccounts.push({
      platform,
      providerAccountId: profile.id,
      handle: profile.handle,
      accessToken: profile.accessToken || tokenData.access_token,
      refreshToken,
      providerData: profile.providerData,
      tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
    });
    await user.save();
    response.redirect(`${getClientUrl()}/admin/dashboard?social_connected=${encodeURIComponent(platform)}#social-accounts`);
  } catch (error) {
    console.error("Social connection failed:", error);
    response.redirect(callbackError(error.message || "Could not connect this account"));
  }
}

router.get("/callback/:platform", (request, response) => handleCallback(request, response));
router.get("/meta/callback", (request, response) => handleCallback(request, response));
router.get("/linkedin/callback", (request, response) => handleCallback(request, response, "LinkedIn"));
router.get("/youtube/callback", (request, response) => handleCallback(request, response, "YouTube"));
router.get("/google/callback", (request, response) => handleCallback(request, response, "Google Business"));

router.delete("/accounts/:platform", requireAuth, async (request, response, next) => {
  try {
    const platform = supportedPlatforms.find((item) => item.toLowerCase() === request.params.platform.toLowerCase());
    if (!platform) return response.status(400).json({ success: false, message: "This social platform is not supported" });
    await User.updateOne(
      {
        _id: request.user._id,
        ...(request.tenantId ? { tenantId: request.tenantId } : {}),
      },
      { $pull: { socialAccounts: { platform } } },
    );
    response.json({ success: true, message: `${platform} disconnected successfully` });
  } catch (error) {
    next(error);
  }
});

router.patch("/accounts/:platform/location", requireAuth, async (request, response, next) => {
  try {
    if (request.params.platform.toLowerCase() !== "google business") {
      return response.status(400).json({ success: false, message: "Location selection is only available for Google Business." });
    }
    const locationName = typeof request.body?.locationName === "string"
      ? request.body.locationName.trim()
      : "";
    if (!locationName) {
      return response.status(400).json({ success: false, message: "A Google Business location is required." });
    }

    const user = await User.findOne({
      _id: request.user._id,
      ...(request.tenantId ? { tenantId: request.tenantId } : {}),
    });
    const account = (user.socialAccounts || []).find((item) => item.platform === "Google Business");
    const location = account?.providerData?.locations?.find((item) => item.name === locationName);
    if (!account || !location) {
      return response.status(404).json({ success: false, message: "That Google Business location is not available on the connected account." });
    }

    account.providerData = {
      ...(account.providerData || {}),
      locationName: location.name,
      locationTitle: location.title,
    };
    await user.save();
    response.json({
      success: true,
      location: { name: location.name, title: location.title },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
