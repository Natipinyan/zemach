global.express = require('express');
const app = express();

const { json } = require("express");
app.use(json());

global.path = require("path");
app.use(express.static(path.join(__dirname, 'public')));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", __dirname + '/views');

global.router = express.Router();

const port = 6060;
app.set("view engine", "ejs");

const main_rtr = require('./routers/main');
app.use('/main', main_rtr);

const dataRouter = require("./routers/dataRouter");
app.use("/data", dataRouter);

app.listen(port, () => {
    console.log(`Now listening to port http://localhost:${port}/main`);
});
