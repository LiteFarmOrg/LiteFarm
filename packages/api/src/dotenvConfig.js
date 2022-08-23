import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
