const express = require('express');
const app = express();
const connectToDb = require('./config/connectToDb');
const cors = require('cors');


connectToDb();
app.use(cors());
app.use(express.json({extended : false}));

app.use('/api/users', require("./routes/users.js"))
// app.use('/api/posts', require("./routes/posts.js"))

let PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server is on port: ${PORT}`);
});