import Notification from "../models/Notification.js";
import NotificationPreference from "../models/NotificationPreference.js";
import NotificationLog from "../models/NotificationLog.js";
import NotificationQueue from "../models/NotificationQueue.js";
import NotificationTemplate from "../models/NotificationTemplate.js";

/**
 * Reusable Centralized Notification Trigger Service
 */
export const sendCentralNotification = async ({
  recipientUser,
  title,
  message,
  category = "Account Updates",
  deliveryChannel = "Dashboard",
  link = "",
  type = "general",
  templateCode = "",
  templateVariables = {},
}) => {
  try {
    if (!recipientUser) return null;

    // Check Partner Preferences if exists
    const pref = await NotificationPreference.findOne({ userId: recipientUser });
    if (pref) {
      // Check channel preference
      const channelKey = deliveryChannel.toLowerCase();
      if (pref.channels && pref.channels[channelKey] === false) {
        // Channel disabled by user, fallback to Dashboard
        deliveryChannel = "Dashboard";
      }
    }

    // Process Template if provided
    let finalTitle = title;
    let finalMessage = message;

    if (templateCode) {
      const template = await NotificationTemplate.findOne({
        templateCode: templateCode.toUpperCase(),
        isActive: true,
      });

      if (template) {
        finalTitle = template.title || title;
        finalMessage = template.dashboardTemplate || message;

        // Replace placeholders e.g. {partnerName}, {commissionAmount}
        Object.keys(templateVariables).forEach((key) => {
          const val = templateVariables[key] || "";
          finalTitle = finalTitle.replace(new RegExp(`{${key}}`, "g"), val);
          finalMessage = finalMessage.replace(new RegExp(`{${key}}`, "g"), val);
        });
      }
    }

    const randNum = Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const notificationId = `NOTIF-${dateStr}-${randNum}`;

    const notification = await Notification.create({
      notificationId,
      recipientUser,
      title: finalTitle,
      message: finalMessage,
      category,
      deliveryChannel,
      type,
      link,
      status: "Delivered",
    });

    // Create Audit Delivery Log
    await NotificationLog.create({
      notificationId: notification._id,
      recipientUser,
      channel: deliveryChannel,
      status: "Delivered",
      responseMetaData: `Simulated successful ${deliveryChannel} dispatch`,
    });

    return notification;
  } catch (err) {
    console.error("Central Notification Error:", err);
    return null;
  }
};
