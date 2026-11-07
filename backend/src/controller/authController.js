import User from "../model/User.js";
import Notification from "../model/Notification.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    const { username, email, phone, password } = req.body;
    
    try {

       if(!username || !email || !phone || !password) {
        return res.status(400).json({ message: "All fields are required" });
    } 
     
    const emailExists = await User.findOne({ email });
    if(emailExists) {
        return res.status(400).json({ message: "Email already exists" });
    }

     const hashedPassword = await bcrypt.hash(password, 10);

     const user = await User.create({
        username,
        email,
        phone,
        password: hashedPassword
     });

      // Create the first unread notification for the new account.
      // The notification screen will show its red dot because isRead defaults to false.
      await Notification.create({
          user: user._id,
          type: "welcome",
          title: "Welcome",
          message: `Thanks for joining ${username}! We're excited to have you here.`,
      });

     res.status(201).json({ message: "User created successfully", user });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
    
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        if(!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
      const user = await User.findOne({ email });

      if(!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if(!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" });
      }

            // This also covers users created before welcome notifications were added.
            // The lookup prevents a second welcome message on later logins.
            const welcomeNotification = await Notification.findOne({
                user: user._id,
                type: "welcome",
            });

            if (!welcomeNotification) {
                await Notification.create({
                    user: user._id,
                    type: "welcome",
                    title: "Welcome",
                    message: `Thanks for joining ${user.username}! We're excited to have you here.`,
                });
            }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.status(200).json({ message: "Login successful", token, user });
        
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
}
