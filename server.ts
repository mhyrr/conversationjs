import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import messagesRouter from './api/messages';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Mount the messages router
app.use('/api/messages', messagesRouter);

app.listen(PORT, () => {
  console.log(`Dev server running on http://localhost:${PORT}`);
}); 