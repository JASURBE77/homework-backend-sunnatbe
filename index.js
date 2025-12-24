const express = require("express");
const UserRoute = require("./routes/user.routes");
const cors = require("cors");
const app = express();
const connectDB = require("./config/db");
const submissionRoutes = require("./routes/submission.routes");
const cookieParser = require("cookie-parser");
const TypingRouter = require("./routes/typingrating.routes")
connectDB();

app.use(cors());

app.use(express.json());
app.use(cookieParser());

app.use("/", UserRoute)
app.use("/", submissionRoutes);
app.use("/", TypingRouter)

const PORT =  8080;

app.listen(PORT, () => {    
    console.log(`server ishga tushdi zor http://localhost:${PORT}`);
    
})