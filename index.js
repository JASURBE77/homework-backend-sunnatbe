const express = require("express");
const UserRoute = require("./routes/user.routes");
const cors = require("cors");
const app = express();
const connectDB = require("./config/db");
const submissionRoutes = require("./routes/submission.routes");
const cookieParser = require("cookie-parser");


connectDB();


app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5500"], // frontend manzili
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/", UserRoute)
app.use("/", submissionRoutes);

const PORT =  8080;

app.listen(PORT, () => {
    console.log(`server ishga tushdi zor http://localhost:${PORT}`);
    
})