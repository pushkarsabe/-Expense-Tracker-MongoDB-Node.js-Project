const express = require('express');
const bodyParser = require('body-parser');
//to avoid cross origin comm error
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./util/database');
const app = express();
app.use(cors());

const expenseRoute = require('./routes/expense');
const userRoute = require('./routes/user');
const purchaseRoute = require('./routes/purchase');
const premiumRoute = require('./routes/premium');
const forgotpasswordRoute = require('./routes/forgotpassword');

//parse application
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());

app.use('/expense', expenseRoute);

app.use('/user', userRoute);

app.use('/purchase', purchaseRoute);

app.use('/premium', premiumRoute);

app.use('/password', forgotpasswordRoute);


const sequel = async () => {
  try {
    await connectDB(  );

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });

  } catch (err) {
    console.log('Error starting server:', err);
  }
}
sequel();

