import Notification from "../model/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.userId,
    })
      .populate("reservation")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      message: "Failed to load notifications",
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      message: "Failed to update notification",
    });
  }
};