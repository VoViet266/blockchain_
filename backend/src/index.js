import 'dotenv/config.js';
import express, { json } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import path from 'path';
import { syncDatabase } from './models/index.js';
import { initBlockchain } from './services/blockchain.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(json());

app.use('/api', routes);

// Phục vụ các file tĩnh cho media/products
app.use('/media', express.static(path.join(process.cwd(), 'media')));

// Kết nối DB và Blockchain
syncDatabase();
initBlockchain();

app.get('/', (req, res) => {
    res.send('Hello BlockChain! Backend is running with Auth setup.');
}); 

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});