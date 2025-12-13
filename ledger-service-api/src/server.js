const express = require('express');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
	console.log('Server is running on http://localhost:3000')
})

app.get('/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
  });
});


app.post('/transaction', (req,res) => {
  res.json({
    
  })
}
)