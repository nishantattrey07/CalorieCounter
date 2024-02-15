const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const userRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
require('dotenv').config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/admin", adminRouter)
app.use("/user", userRouter)
const port=3000

app.get('/', (req, res) => {
    res.send("Welcome to CalorieCounter");
});
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});