const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://e3-hklckjlr3-chumbis-projects.vercel.app',
  'https://e3.vercel.app',
];

// Add custom CORS origin from env if exists
if (process.env.CORS_ORIGIN) {
  const origins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
  allowedOrigins.push(...origins);
}

export const corsConfig = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In production, allow all Vercel deployment URLs
      if (origin.includes('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
