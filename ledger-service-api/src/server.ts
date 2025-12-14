import express, { Request, Response } from 'express';
import transactionRoutes from './interface/routes/transactionRoutes';

const app = express();

app.use(express.json());

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof SyntaxError ) {
    return res.status(400).json({
      error: "Invalid JSON payload",
    });
  }
  next(err);
});

app.use(transactionRoutes);

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
