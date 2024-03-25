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
const {CompareByWeek, CompareByMonth } = require('./src/Controller/notificationController')
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
    
    app.listen(5000, () => {
      console.log('Node API app is running on port 5000');
    });
  })
  .catch((error) => {
    console.log(error);
  });
  // async function runCompareByWeek() {
  //   try {
  //     // Gọi hàm CompareByWeek và lưu kết quả vào biến results
  //     const results = await CompareByWeek();
  
  //     // Xử lý kết quả ở đây
  //     console.log(results);
  
  //     // Gửi phản hồi HTTP thành công nếu cần thiết
  //     // res.status(200).json(results);
  //   } catch (error) {
  //     // Xử lý lỗi ở đây
  //     console.error(error);
  
  //     // Gửi phản hồi HTTP lỗi nếu cần thiết
  //     // res.status(500).json({ message: 'Internal server error' });
  //   }
  // }
  // async function runCompareByMonth() {
  //   try {
  //     // Gọi hàm CompareByWeek và lưu kết quả vào biến results
  //     const results = await CompareByMonth();
  
  //     // Xử lý kết quả ở đây
  //     console.log(results);
  
  //     // Gửi phản hồi HTTP thành công nếu cần thiết
  //     // res.status(200).json(results);
  //   } catch (error) {
  //     // Xử lý lỗi ở đây
  //     console.error(error);
  
  //     // Gửi phản hồi HTTP lỗi nếu cần thiết
  //     // res.status(500).json({ message: 'Internal server error' });
  //   }
  // }
  
  // // Chạy hàm runCompareByWeek
  // runCompareByWeek();
  // runCompareByMonth();