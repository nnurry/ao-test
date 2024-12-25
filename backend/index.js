const express = require('express');
const app = express();
const routes = require('./routes');
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/elevator', routes);

app.listen(port, () => {
    console.log(`Elevator app listening on port ${port}`);
});
