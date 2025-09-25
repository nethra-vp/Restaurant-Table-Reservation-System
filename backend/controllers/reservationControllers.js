import reservationModels from "../models/reservationModels.js";

const createReservation = async (req, res) => {
    try {
        const {name, email, phone, date, time, guests} = req.body;
        if(!name || !email || !phone || !date || !time || !guests) {
            return res.json({success:false, message: "All fields are required"})
        }

        const newReservation = new reservationModels({name, email, phone, date, time, guests})
        await newReservation.save()
    } catch (error) {
        console.log(error);
        res.json({message: error.message})
    }
}

const getAllReservations = async (req, res) => {
    
}

const deleteReservation = async (req, res) => {
    
}

export {createReservation, getAllReservations, deleteReservation}