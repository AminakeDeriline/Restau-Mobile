// Auth Middleware to check if the user is authenticated
// lets the app know which user owns reservation and notifications 
import jwt from "jsonwebtoken";
import User from "../model/User.js";

export default function authenticate(req,res,next)  {

    //Extracts the authorization header value from incoming request headers.
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1]; // Extracts the token from the header

    //try block error to catch errors during decoding the token bearer
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifies the token using the secret key
        req.user = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "invalid or expired token" });
    }
}