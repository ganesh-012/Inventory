const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')
const authMiddleware = require('./middlewares/authMiddleware')
const app = express();
dotenv.config();

app.use(express.json())
app.use(cors())


const authRouter = require('./routes/authRouter')
const productRouter = require('./routes/productRouter')
const orderRouter = require('./routes/orderRouter')
const supplierRouter = require('./routes/supplierRouter')
const dashboardRouter = require('./routes/dashboardRouter')

app.use('/api/auth', authRouter)
app.use('/api/product',authMiddleware, productRouter)
app.use('/api/order', authMiddleware, orderRouter)
app.use('/api/supplier', authMiddleware, supplierRouter)
app.use('/api/dashboard', authMiddleware, dashboardRouter)

//mongodb connection
const MONGODB_URl = process.env.MONGODB_URl
mongoose.connect(MONGODB_URl).then(() => {
    console.log('database is connected successfully')
}).catch(() => {
    console.log('error in database connection')
})


// server connection
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`)
})