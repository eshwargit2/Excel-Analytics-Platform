// const express = require('express');
// const cors = require('cors');
// const app = express();
// const PORT = 5000;
// app.use(cors());
// app.use(express.json());
// app.post('/login', (req, res) => {
//   const { username, password, } = req.body;
//   res.send('Login data received successfully!');
//   console.log('Username:', username);
//   console.log('Password:', password);
// });


// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });


const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/loginDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', UserSchema);

// Registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send('User already exists');

    const newUser = new User({ username, password });
    await newUser.save();
    res.send('User registered');
  } catch (err) {
    res.status(500).send('Error registering user');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    res.status(500).send('Error logging in');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
