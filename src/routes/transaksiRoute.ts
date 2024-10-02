import express from "express"
import { getTransaksi, createTransaksi, deleteTransaksi } from "../controllers/transaksiController"
const app = express()

app.use(express.json())
/** add middleware process to verify token */
app.get(`/`, getTransaksi)

/** add middleware process to verify token and verify request data */
app.post(`/`, createTransaksi)

/** add middleware process to verify token */
app.delete(`/:id`, deleteTransaksi)

/** add middleware process to verify token */
export default app