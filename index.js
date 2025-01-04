const express = require('express');
const app = express();
const PORT = 8000;

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello, Welcome to the Tourism App!' });
});

app.post('/', (req, res) => {
  res.send('You can hit post request to this URL');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
