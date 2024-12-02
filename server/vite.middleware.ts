import { Express } from 'express';
import { resolve } from 'path';

export function setupViteRewrite(app: Express) {
  // Handle client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/auth/token')) {
      return next();
    }
    res.sendFile(resolve(__dirname, '../index.html'));
  });
} 