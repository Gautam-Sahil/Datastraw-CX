require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('mongodb connected'))
  .catch(err => console.error(err));

app.use('/api', apiRoutes);
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.send('cx api running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));