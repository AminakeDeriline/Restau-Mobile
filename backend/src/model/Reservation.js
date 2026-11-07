import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, //gets the id of the user
        ref: "User", 
        required: true
        
    },
    restaurant: { 
        type: String,
        required: true
    },
     
    reservationDate: {
        type: Date,
        required: true
       },
    guests: { 
        type: Number,
        required: true,
        min:1
    },
    foodOrders: [{
        name:String,
        quantity: Number,
        price: Number,
    
    },
],
   totalPrice: {
    type: Number,
    required: true,
    default: 0
},
    status: {
    type: String,
    enum: ["confirmed","pending" , "cancelled"],
    default: "confirmed"
},
},
  {timestamps: true}
);

export default mongoose.model("Reservation", reservationSchema);