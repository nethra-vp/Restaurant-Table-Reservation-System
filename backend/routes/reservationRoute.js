import express from 'express'
import {createReservation, getAllReservations, deleteReservation} from '../controllers/reservationControllers.js'

const router = express.Router()

router.post('/create', createReservation)
router.get('/get', getAllReservations)
router.delete('/delete/:id', deleteReservation)

export default router