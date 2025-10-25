import reservationModels from "../models/reservationModels.js";

const createReservation = async (req, res) => {
    try {
        const {name, email, phone, date, time, guests} = req.body;
        if(!name || !email || !phone || !date || !time || !guests) {
            return res.json({success:false, message: "All fields are required"})
        }

        const newReservation = new reservationModels({name, email, phone, date, time, guests})
        await newReservation.save()

        return res.status(201).json({success: true, message: "Reservation created successfully", reservation: newReservation});
    } catch (error) {
        res.json({error: "Error creating reservation"})
    }
}

const getAllReservations = async (req, res) => {
    try {
        const reservations = await reservationModels.find()
        // return an object so frontend can read response.data.reservations
        res.json({ reservations })
    } catch (error) {
        res.json({message: "Error fetching reservations"})
    }
}

const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params
        await reservationModels.findByIdAndDelete(id)
        res.json({ success: true, message: "Reservation removed" })
    } catch (error) {
        res.json({error: "Error deleting reservation"})
    }
}

export {createReservation, getAllReservations, deleteReservation}