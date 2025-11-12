import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema({
    name: {type:String, required: true},
    email: {type:String, required: true},
    phone: {type:String, required: true},
    date: {type:String, required: true},
    time: {type:String, required: true},
    guests: {type:Number, required: true}, 
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" }
})

export default mongoose.model("Reservation", reservationSchema)