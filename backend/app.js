import express from "express";
import connectDB from "./src/config/dbConnect.js";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import cors from "cors";
import reservationRoutes from "./src/routes/reservationRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";

dotenv.config();
const app = express();
connectDB();
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/notifications", notificationRoutes);

app.get('/', async (req, res) => {
    res.send("Hello World. Welcome to the backend"); //This line of code means we are making a get resquest to the root route
                                          //  and this message will appear when a user accesses the backend through its Port num

    
    });

export default app;