const express = require('express');
const app = express();
const routes = require('./routes');
const cors = require("cors");

const port = 5000;

app.use(cors());
app.use(express.json());
app.use('/elevator', routes);

app.listen(port, () => {
    console.log(`Elevator app listening on port ${port}`);
});
