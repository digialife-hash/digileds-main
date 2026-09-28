const { Readable } = require("stream");
const crypto = require("crypto");

function providerAccount(user, platform) {
  return (user.socialAccounts || []).find((account) => account.platform === platform);
}

function platformsOf(post) {
  return String(post.platform || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeGoogleLocationName(locationName, accountName) {
  if (!locationName) return "";
  if (locationName.startsWith("accounts/")) return locationName;
  if (locationName.startsWith("locations/") && accountName) {
    return `${accountName}/${locationName}`;
  }
  return locationName;
}

function configuredGoogleStoreCode() {
  return process.env.GOOGLE_BUSINESS_STORE_CODE?.trim().replace(/\s+/g, "") || "";
}

function matchesGoogleLocation(location, storeCode) {
  return location.storeCode === storeCode
    || location.name.endsWith(`/locations/${storeCode}`)
    || location.title.toLowerCase() === "digital alife pvt. ltd.";
}

async function uploadToCloudinary(media) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary media hosting is not configured");
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
    .digest("hex");
  const form = new FormData();
  form.set("file", new Blob([media.data], { type: media.mimeType }), media.originalName || "upload");
  form.set("api_key", process.env.CLOUDINARY_API_KEY);
  form.set("timestamp", String(timestamp));
  form.set("signature", signature);
  const resourceType = media.mimeType?.startsWith("video/") ? "video" : "image";
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: form },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Media hosting upload failed");
  }
  return { url: data.secure_url, resourceType };
}

async function refreshGoogleAccessToken(account, platform, force = false) {
  if (!account.refreshToken) {
    if (!account.accessToken) {
      throw new Error(`${platform} is not authorized. Reconnect the account.`);
    }
    if (force) {
      throw new Error(`${platform} authorization expired and no refresh token is available. Disconnect and reconnect the account.`);
    }
    return account.accessToken;
  }
  if (!force && account.tokenExpiresAt && account.tokenExpiresAt.getTime() > Date.now() + 60_000) return account.accessToken;
  const isBusiness = platform === "Google Business";
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refreshToken,
      client_id: isBusiness ? process.env.GOOGLE_BUSINESS_CLIENT_ID : process.env.YOUTUBE_CLIENT_ID,
      client_secret: isBusiness ? process.env.GOOGLE_BUSINESS_CLIENT_SECRET : process.env.YOUTUBE_CLIENT_SECRET,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(data.error_description || `${platform} authorization expired. Reconnect it.`);
  account.accessToken = data.access_token;
  account.tokenExpiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000);
  return account.accessToken;
}

async function refreshYouTubeAccessToken(account) {
  return refreshGoogleAccessToken(account, "YouTube");
}

async function publishYouTube(post, account) {
  if (!post.media?.data) throw new Error("YouTube requires a video file");
  if (!post.media.mimeType?.startsWith("video/")) throw new Error("YouTube publishing requires a video file");
  const accessToken = await refreshYouTubeAccessToken(account);
  const initResponse = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": post.media.mimeType,
        "X-Upload-Content-Length": String(post.media.data.length),
      },
      body: JSON.stringify({
        snippet: {
          title: post.title,
          description: [post.caption, post.hashtags].filter(Boolean).join("\n\n"),
        },
        status: { privacyStatus: post.visibility === "Private" ? "private" : "public" },
      }),
    },
  );
  if (!initResponse.ok) {
    const errorBody = await initResponse.text();
    if (initResponse.status === 401 || initResponse.status === 403) {
      throw new Error("YouTube upload permission is missing. Disconnect YouTube, reconnect it, and allow video upload permission.");
    }
    throw new Error(errorBody || "YouTube upload could not be initialized");
  }
  const uploadUrl = initResponse.headers.get("location");
  if (!uploadUrl) throw new Error("YouTube did not return an upload URL");
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": post.media.mimeType, "Content-Length": String(post.media.data.length) },
    body: Readable.from(post.media.data),
    duplex: "half",
  });
  const uploaded = await uploadResponse.json().catch(() => ({}));
  if (!uploadResponse.ok || !uploaded.id) throw new Error(uploaded.error?.message || "YouTube upload failed");
  if (post.thumbnail?.data) {
    const thumbnailResult = await setPublishedThumbnail(
      { providerResults: { YouTube: { id: uploaded.id } } },
      { socialAccounts: [account] },
      "YouTube",
      { buffer: post.thumbnail.data, mimetype: post.thumbnail.mimeType },
    );
    if (!thumbnailResult?.thumbnailUrl) {
      throw new Error("YouTube did not confirm the new thumbnail.");
    }
    return {
      id: uploaded.id,
      url: `https://www.youtube.com/watch?v=${uploaded.id}`,
      thumbnailUrl: thumbnailResult.thumbnailUrl,
    };
  }
  return { id: uploaded.id, url: `https://www.youtube.com/watch?v=${uploaded.id}` };
}

async function publishInstagram(post, account) {
  if (!post.media?.data) throw new Error("Instagram requires an image or video file");
  const hosted = await uploadToCloudinary(post.media);
  const graphVersion = process.env.META_GRAPH_VERSION || "v23.0";
  const instagramUserId = account.providerAccountId;
  const instagramAccessToken = account.accessToken;
  const containerParams = new URLSearchParams({
    access_token: instagramAccessToken,
    caption: [post.caption, post.hashtags].filter(Boolean).join("\n\n"),
  });
  if (hosted.resourceType === "video") {
    containerParams.set("media_type", "REELS");
    containerParams.set("video_url", hosted.url);
  } else {
    containerParams.set("image_url", hosted.url);
  }
  const containerResponse = await fetch(
    `https://graph.facebook.com/${graphVersion}/${instagramUserId}/media`,
    { method: "POST", body: containerParams },
  );
  const container = await containerResponse.json().catch(() => ({}));
  if (!containerResponse.ok || !container.id) {
    throw new Error(container.error?.message || "Instagram media container creation failed");
  }
  if (hosted.resourceType === "video") {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const statusResponse = await fetch(
        `https://graph.facebook.com/${graphVersion}/${container.id}?fields=status_code&access_token=${encodeURIComponent(instagramAccessToken)}`,
      );
      const status = await statusResponse.json().catch(() => ({}));
      if (status.status_code === "ERROR") throw new Error("Instagram video processing failed");
      if (status.status_code === "FINISHED") break;
      if (attempt === 11) throw new Error("Instagram video is still processing; try publishing again shortly");
    }
  }
  const publishResponse = await fetch(
    `https://graph.facebook.com/${graphVersion}/${instagramUserId}/media_publish`,
    {
      method: "POST",
      body: new URLSearchParams({
        creation_id: container.id,
        access_token: instagramAccessToken,
      }),
    },
  );
  const published = await publishResponse.json().catch(() => ({}));
  if (!publishResponse.ok || !published.id) {
    throw new Error(published.error?.message || "Instagram publish failed");
  }
  return { id: published.id, url: `https://www.instagram.com/p/${published.id}/`, mediaUrl: hosted.url };
}

async function deleteInstagramMedia(result, account) {
  if (result?.id && account) {
    throw new Error("Instagram media deletion is not supported by the official Instagram Graph API. Delete this post from Instagram directly.");
  }
  throw new Error("Instagram published media details are missing");
}

async function publishFacebook(post, account) {
  const graphVersion = process.env.META_GRAPH_VERSION || "v23.0";
  const pageId = account.providerData?.pageId || account.providerAccountId;
  const form = new FormData();
  form.set("access_token", account.accessToken);
  form.set("message", [post.caption, post.hashtags].filter(Boolean).join("\n\n"));
  let endpoint = `https://graph.facebook.com/${graphVersion}/${pageId}/feed`;
  if (post.media?.data) {
    form.set("source", new Blob([post.media.data], { type: post.media.mimeType }), post.media.originalName || "upload");
    endpoint = post.media.mimeType.startsWith("video/")
      ? `https://graph.facebook.com/${graphVersion}/${pageId}/videos`
      : `https://graph.facebook.com/${graphVersion}/${pageId}/photos`;
  }

  const response = await fetch(endpoint, { method: "POST", body: form });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || (!data.id && !data.post_id)) throw new Error(data.error?.message || "Facebook publish failed");
  const id = data.id || data.post_id;
  return { id, url: `https://www.facebook.com/${id}` };
}

async function refreshXAccessToken(account) {
  if (!account.refreshToken) return account.accessToken;
  const response = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({ refresh_token: account.refreshToken, grant_type: "refresh_token" }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(data.error_description || "X authorization expired. Reconnect X.");
  account.accessToken = data.access_token;
  account.refreshToken = data.refresh_token || account.refreshToken;
  account.tokenExpiresAt = new Date(Date.now() + (data.expires_in || 7200) * 1000);
  return account.accessToken;
}

async function publishX(post, account) {
  if (post.media?.data) throw new Error("X media publishing needs an approved media-upload API; text publishing is available.");
  const accessToken = await refreshXAccessToken(account);
  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: [post.caption, post.hashtags].filter(Boolean).join("\n\n") }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.data?.id) throw new Error(data.detail || data.title || "X publish failed");
  return { id: data.data.id, url: `https://x.com/i/web/status/${data.data.id}` };
}

async function publishGoogleBusiness(post, account) {
  let accessToken = await refreshGoogleAccessToken(account, "Google Business");
  let locationName = account.providerData?.locationName;
  const storeCode = configuredGoogleStoreCode();
  if (
    !locationName
    || (locationName.startsWith("locations/") && !account.providerData?.accountName)
    || (storeCode && account.providerData?.storeCode !== storeCode)
  ) {
    let accountsResponse = await fetch(
      "https://mybusinessbusinessinformation.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (accountsResponse.status === 401) {
      accessToken = await refreshGoogleAccessToken(account, "Google Business", true);
      accountsResponse = await fetch(
        "https://mybusinessbusinessinformation.googleapis.com/v1/accounts",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    }
    const accountsData = await accountsResponse.json().catch(() => ({}));
    if (!accountsResponse.ok || !accountsData.accounts?.[0]?.name) {
      throw new Error(
        accountsResponse.status === 401
          ? "Google Business authorization was rejected. Disconnect and reconnect Google Business, then allow Business Profile access."
          : accountsData.error?.message ||
            "Google Business Profile returned no accessible business account. Reconnect Google Business with the correct location permissions.",
      );
    }

    const businessAccount = accountsData.accounts[0];
    let locationsResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${businessAccount.name}/locations?readMask=name,title,storeCode`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (locationsResponse.status === 401) {
      accessToken = await refreshGoogleAccessToken(account, "Google Business", true);
      locationsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${businessAccount.name}/locations?readMask=name,title,storeCode`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    }
    const locationsData = await locationsResponse.json().catch(() => ({}));
    if (!locationsResponse.ok || !locationsData.locations?.[0]?.name) {
      throw new Error(
        locationsData.error?.message ||
          "No Google Business location is accessible for this account. Verify that the Google account manages a verified Business Profile location, then reconnect it.",
      );
    }

    const locations = locationsData.locations.map((location) => ({
      name: normalizeGoogleLocationName(location.name, businessAccount.name),
      title: location.title || "Google Business location",
      storeCode: location.storeCode || "",
    }));
    const selectedLocation = storeCode
      ? locations.find((location) => matchesGoogleLocation(location, storeCode))
      : locations[0];
    if (!selectedLocation) {
      throw new Error(
        `Google Business store code ${storeCode} was not found. Check GOOGLE_BUSINESS_STORE_CODE in Backend/.env.`,
      );
    }
    account.providerData = {
      ...(account.providerData || {}),
      accountName: businessAccount.name,
      locations,
      locationName: selectedLocation.name,
      locationTitle: selectedLocation.title,
      storeCode: selectedLocation.storeCode,
    };
    locationName = selectedLocation.name;
  }
  locationName = normalizeGoogleLocationName(locationName, account.providerData?.accountName);
  const media = post.media?.data ? await uploadToCloudinary(post.media) : null;
  if (media?.resourceType === "video") {
    throw new Error("Google Business Profile local posts support photos, not video uploads.");
  }
  const summary = [post.caption || post.title, post.hashtags].filter(Boolean).join("\n\n").trim();
  if (!summary) throw new Error("Google Business posts require a caption or title.");
  if (summary.length > 1500) throw new Error("Google Business post text must be 1,500 characters or fewer.");
  const requestBody = {
    languageCode: "en-US",
    summary,
    topicType: "STANDARD",
    ...(media ? { media: [{ mediaFormat: "PHOTO", sourceUrl: media.url }] } : {}),
  };
  let response = await fetch(`https://mybusiness.googleapis.com/v4/${locationName}/localPosts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  if (response.status === 401) {
    accessToken = await refreshGoogleAccessToken(account, "Google Business", true);
    response = await fetch(`https://mybusiness.googleapis.com/v4/${locationName}/localPosts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
  }
  const responseText = await response.text();
  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = {};
  }
  if (!response.ok || !data.name) {
    if (response.status === 401) {
      throw new Error("Google Business authorization was rejected. Disconnect and reconnect Google Business, then allow Business Profile access.");
    }
    if (response.status === 403) {
      throw new Error(data.error?.message || "Google Business permission denied. Enable the Business Profile API and reconnect the account.");
    }
    if (response.status === 404) {
      throw new Error(data.error?.message || "Google Business location was not found. Reconnect Google Business to refresh the location.");
    }
    throw new Error(
      data.error?.message ||
        (responseText ? `Google Business publish failed (${response.status}): ${responseText.slice(0, 300)}` : "Google Business publish failed"),
    );
  }
  let verified = data;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const verifyResponse = await fetch(`https://mybusiness.googleapis.com/v4/${data.name}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const verifyText = await verifyResponse.text();
    let verifyData = {};
    try {
      verifyData = verifyText ? JSON.parse(verifyText) : {};
    } catch {
      verifyData = {};
    }
    if (verifyResponse.ok && verifyData.name) {
      verified = verifyData;
      break;
    }
    if (verifyResponse.status === 401 && attempt === 0) {
      accessToken = await refreshGoogleAccessToken(account, "Google Business", true);
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const state = verified.state || verified.status;
  if (String(state).toUpperCase() === "REJECTED") {
    throw new Error(
    verified.rejectionReason ||
      verified.error?.message ||
      "Google Business rejected this post. Check the post content and Google Business Profile policy requirements.",
    );
  }
  return {
    id: data.name,
    url: verified.searchUrl || data.searchUrl || data.name,
    state: state || "PROCESSING",
  };
}

async function publishPost(post, user) {
  const results = {};
  const errors = [];
  for (const platform of platformsOf(post)) {
    const account = providerAccount(user, platform);
    if (!account) {
      errors.push(`${platform} account is not connected`);
      continue;
    }
    try {
      if (platform === "YouTube") results[platform] = await publishYouTube(post, account);
      else if (platform === "Facebook") results[platform] = await publishFacebook(post, account);
      else if (platform === "X") results[platform] = await publishX(post, account);
      else if (platform === "Google Business") results[platform] = await publishGoogleBusiness(post, account);
      else if (platform === "Instagram") results[platform] = await publishInstagram(post, account);
      else errors.push(`${platform} publishing is not implemented`);
    } catch (error) {
      errors.push(`${platform}: ${error.message}`);
    }
  }
  if (errors.length) {
    const rollbackErrors = [];
    for (const platform of Object.keys(results)) {
      try {
        await deletePublishedPost(
          { providerResults: { [platform]: results[platform] } },
          user,
          platform,
        );
      } catch (error) {
        rollbackErrors.push(`${platform}: ${error.message}`);
      }
    }
    const rollbackMessage = rollbackErrors.length
      ? ` Rollback failed: ${rollbackErrors.join("; ")}`
      : " All completed platform uploads were rolled back.";
    return {
      providerResults: {},
      publishError: `${errors.join("; ")}.${rollbackMessage}`,
    };
  }
  if (user.isModified?.("socialAccounts")) await user.save();
  return { providerResults: results };
}

async function deletePublishedPost(post, user, platform) {
  const result = post.providerResults?.[platform];
  const account = providerAccount(user, platform);
  if (!result?.id || !account) throw new Error(`${platform} published item or connected account was not found`);
  if (platform === "Facebook") {
    const response = await fetch(`https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v23.0"}/${encodeURIComponent(result.id)}?access_token=${encodeURIComponent(account.accessToken)}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success !== true) {
      const detail = data.error?.message || "Facebook deletion failed";
      if (data.error?.code === 10) {
        throw new Error("Facebook delete permission is missing for this Page. Disconnect and reconnect Facebook with Page management permissions.");
      }

      async function updatePublishedVisibility(post, user, platform, visibility) {
        if (platform !== "YouTube") {
          throw new Error(`${platform} visibility editing is not supported by the official API.`);
        }

        async function setPublishedThumbnail(post, user, platform, thumbnail) {
          if (platform !== "YouTube") {
            throw new Error(`${platform} thumbnail editing is not supported by the official API.`);
          }
          if (!thumbnail?.buffer || !thumbnail.mimetype?.startsWith("image/")) {
            throw new Error("YouTube thumbnails must be an image.");
          }
          if (thumbnail.buffer.length > 2 * 1024 * 1024) {
            throw new Error("YouTube thumbnails must be 2 MB or smaller.");
          }
          if (thumbnail.buffer.length > 2 * 1024 * 1024) {
            throw new Error("YouTube thumbnails must be 2 MB or smaller.");
          }
          const result = post.providerResults?.YouTube;
          const account = providerAccount(user, "YouTube");
          if (!result?.id || !account) throw new Error("YouTube video or connected account was not found");
          const accessToken = await refreshYouTubeAccessToken(account);
          const response = await fetch(
            `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?uploadType=media&videoId=${encodeURIComponent(result.id)}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": thumbnail.mimetype,
                "Content-Length": String(thumbnail.buffer.length),
              },
              body: thumbnail.buffer,
            },
          );
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.items?.[0]?.default?.url) {
            if (response.status === 401 || response.status === 403) {
              throw new Error("YouTube thumbnail permission is missing. Reconnect YouTube and allow youtube.upload permission.");
            }
            throw new Error(data.error?.message || "YouTube thumbnail update failed");
          }
          const thumbnailUrl = data.items[0].default.url;
          for (let attempt = 0; attempt < 3; attempt += 1) {
            const verifyResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(result.id)}`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            const verified = await verifyResponse.json().catch(() => ({}));
            const verifiedThumbnail = verified.items?.[0]?.snippet?.thumbnails;
            if (
              verifyResponse.ok
              && verifiedThumbnail
              && Object.values(verifiedThumbnail).some((item) => item?.url === thumbnailUrl)
            ) {
              return { thumbnailUrl };
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          throw new Error("YouTube accepted the thumbnail upload but has not made the new thumbnail available yet. Try again shortly.");
        }
        if (!["Public", "Private"].includes(visibility)) {
          throw new Error("YouTube visibility must be Public or Private.");
        }
        const result = post.providerResults?.YouTube;
        const account = providerAccount(user, "YouTube");
        if (!result?.id || !account) throw new Error("YouTube video or connected account was not found");
        const accessToken = await refreshYouTubeAccessToken(account);
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=status`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: result.id,
              status: { privacyStatus: visibility.toLowerCase() },
            }),
          },
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.id) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("YouTube visibility permission is missing. Reconnect YouTube and allow youtube.force-ssl permission.");
          }
          throw new Error(data.error?.message || "YouTube visibility update failed");
        }
      }
      throw new Error(detail);
    }
    return;
  }
  if (platform === "X") {
    const accessToken = await refreshXAccessToken(account);
    const response = await fetch(`https://api.twitter.com/2/tweets/${encodeURIComponent(result.id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.data?.deleted !== true) throw new Error(data.detail || "X deletion failed");
    return;
  }
  if (platform === "Google Business") {
    /*
    const accessToken = await refreshGoogleAccessToken(account, platform);
    const response = await fetch(`https://mybusiness.googleapis.com/v4/${result.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) throw new Error((await response.text()) || "Google Business deletion failed");
    return;
  }
    */
  }
  if (platform === "Google Business") {
    let accessToken = await refreshGoogleAccessToken(account, platform);
    let response = await fetch(`https://mybusiness.googleapis.com/v4/${result.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.status === 401) {
      accessToken = await refreshGoogleAccessToken(account, platform, true);
      response = await fetch(`https://mybusiness.googleapis.com/v4/${result.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
    if (response.ok || response.status === 404 || response.status === 410) return;
    const body = await response.text();
    throw new Error(body || "Google Business deletion failed");
  }
  if (platform === "Instagram") {
    await deleteInstagramMedia(result, account);
    return;
  }
  if (platform !== "YouTube") throw new Error(`${platform} deletion is not implemented yet`);
  const accessToken = await refreshYouTubeAccessToken(account);
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(result.id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const body = await response.text();
    try {
      const data = JSON.parse(body);
      if (response.status === 404 && data.error?.errors?.some((item) => item.reason === "videoNotFound")) {
        return;
      }
    } catch {
      // Preserve the provider response below when it is not JSON.
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("YouTube delete permission is missing. Disconnect YouTube, revoke this app from your Google Account, reconnect it, and allow youtube.force-ssl permission.");
    }
    throw new Error(body || "YouTube deletion failed");
  }
}

async function updatePublishedVisibility(post, user, platform, visibility) {
  if (platform !== "YouTube") {
    throw new Error(`${platform} visibility editing is not supported by the official API.`);
  }
  if (!["Public", "Private"].includes(visibility)) {
    throw new Error("YouTube visibility must be Public or Private.");
  }
  const result = post.providerResults?.YouTube;
  const account = providerAccount(user, "YouTube");
  if (!result?.id || !account) throw new Error("YouTube video or connected account was not found");
  const accessToken = await refreshYouTubeAccessToken(account);
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/videos?part=status",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: result.id,
        status: { privacyStatus: visibility.toLowerCase() },
      }),
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("YouTube visibility permission is missing. Reconnect YouTube and allow youtube.force-ssl permission.");
    }
    throw new Error(data.error?.message || "YouTube visibility update failed");
  }
}

async function setPublishedThumbnail(post, user, platform, thumbnail) {
  if (platform !== "YouTube") {
    throw new Error(`${platform} thumbnail editing is not supported by the official API.`);
  }
  if (!thumbnail?.buffer || !thumbnail.mimetype?.startsWith("image/")) {
    throw new Error("YouTube thumbnails must be an image.");
  }
  const result = post.providerResults?.YouTube;
  const account = providerAccount(user, "YouTube");
  if (!result?.id || !account) throw new Error("YouTube video or connected account was not found");
  const accessToken = await refreshYouTubeAccessToken(account);
  const response = await fetch(
    `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?uploadType=media&videoId=${encodeURIComponent(result.id)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": thumbnail.mimetype,
        "Content-Length": String(thumbnail.buffer.length),
      },
      body: thumbnail.buffer,
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.items?.[0]?.default?.url) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("YouTube thumbnail permission is missing. Reconnect YouTube and allow youtube.upload permission.");
    }
    throw new Error(data.error?.message || "YouTube thumbnail update failed");
  }
  return { thumbnailUrl: data.items[0].default.url };
}

async function reconcileProviderResults(post, user) {
  const providerResults = { ...(post.providerResults || {}) };
  const account = providerAccount(user, "YouTube");
  const youtubeResult = providerResults.YouTube;
  if (account && youtubeResult?.id) {
    const accessToken = await refreshYouTubeAccessToken(account);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=id&id=${encodeURIComponent(youtubeResult.id)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      if (!data.items?.length) delete providerResults.YouTube;
    }
  }
  return providerResults;
}

module.exports = {
  publishPost,
  deletePublishedPost,
  updatePublishedVisibility,
  setPublishedThumbnail,
  reconcileProviderResults,
};
