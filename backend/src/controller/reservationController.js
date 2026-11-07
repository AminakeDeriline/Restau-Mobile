import Reservation from "../model/Reservation.js";
import Notification from "../model/Notification.js";

export const createReservation = async (req, res) => {
  try {
    const {
      restaurant,
      reservationDate,
      guests,
      foodOrders,
      totalPrice,
    } = req.body;

    if (!restaurant || !reservationDate || !guests) {
      return res.status(400).json({
        message: "Restaurant, reservation date, and guests are required",
      });
    }

    const reservation = await Reservation.create({
      user: req.userId,
      restaurant,
      reservationDate,
      guests,
      foodOrders: foodOrders || [],
      totalPrice: totalPrice || 0,
    });

    await Notification.create({
      user: req.userId,
      type: "reservation_confirmed",
      title: "Reservation Confirmed",
      message: `Your reservation at ${restaurant} on ${new Date(
        reservationDate
      ).toLocaleString()} for ${guests} guest${guests === 1 ? "" : "s"} has been confirmed. Total: FCFA ${Number(
        totalPrice || 0
      ).toLocaleString("fr-FR")}.`,
      reservation: reservation._id,
    });

    await Notification.create({
      user: req.userId,
      type: "new_order",
      title: "New Order Received",
      message: "Your order has been received. We will update you soon.",
    });

    res.status(201).json({
      message: "Reservation created successfully",
      reservation,
    });
  } catch (error) {
    console.error("Create reservation error:", error);
    res.status(500).json({ message: "Failed to create reservation" });
  }
};