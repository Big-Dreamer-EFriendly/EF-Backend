const mongoose = require('mongoose');
const dotenv = require('dotenv');
const routes = require('./src/Routes/index');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express'); 
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const { Cookie } = require('express-session');

const crossOptions = {
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
};
app.use(cookieParser());

app.use(express.json())

app.use(cors(crossOptions));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    next();
});


app.use(bodyParser.json())
app.use(morgan("common"))
app.use("/api/testCiCD", (req, res) => {
  return res.status(200).json({
    message: "Test CI/CD"
  });
});
routes(app)
mongoose
  .connect('mongodb+srv://ptho6452:0123485941a@efriendly.8nhsbfc.mongodb.net/efriendly?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB');
    
    app.listen(3000, () => {
      console.log('Node API app is running on port 3000');
    });
  })
  .catch((error) => {
    console.log(error);
  });