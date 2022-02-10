const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const redis = require("redis")
let RedisStore = require("connect-redis")(session)
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, SESSION_SECRET, REDIS_PORT } = require("./config/config")

let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT 
})

const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")
const app = express()

app.use(session({
    store: new RedisStore({
        client: redisClient
    }),
    secret: SESSION_SECRET,
    cookie:{
        secure: false,
        saveUninitialized: false,
        resave: false,
        httpOnly: true,
        maxAge: 30000000
    }
}))

const mongoURL=`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectWithRetry = () => {
    mongoose.connect(mongoURL)
    .then(()=>{
        console.log("Successfully connected to db")
    })
    .catch((e)=>{
        console.log(e)
        setTimeout(connectWithRetry, 5000);
    })
}

connectWithRetry()




app.use(express.json())
app.use("/posts",postRouter)
app.use("/users",userRouter)

const port = process.env.PORT || 3000

app.get("/",(req,res) =>{
    res.send("<h2>Hi There!!!!! <h2>")
})

app.listen(port, () => console.log(`listening on port ${port}`))