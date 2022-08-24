const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const unless = require('express-unless');
const path = require('path')
const { v4: uuidv4 } = require('uuid');
const userRoutes = require('./routes/usersRoutes');
const globalErrorHandler = require('./controllers/errorController');
const authMiddleware = require('./middleware/auth');
// Start express app
const app = express();

app.enable('trust proxy');

// GLOBAL MIDDLEWARES
app.use(cors());
// Serving static files
app.use("/api", express.static(path.join(__dirname, "public")));
// Middleware for authenticating token submitted with requests
authMiddleware.authenticateToken.unless = unless;
app.use(
  authMiddleware.authenticateToken.unless({
    path: [
      { url: '/api/v1/users/forgot', methods: ['POST'] },
      { url: '/api/v1/users/create', methods: ['POST'] },
      { url: '/api/v1/users/login', methods: ['POST'] }
    ]
  })
);



// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use("/api", express.static(path.join(__dirname, "color")));

// Body parser, reading data from body into req.body

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb', parameterLimit: "5000" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// use compresssion
app.use(compression());

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static("views"));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req);
  next();
});

// ROUTES
app.use('/api/v1/users', userRoutes);

app.use('/api/v1/test', (req, res, next) => {
  res.status(200).json({ status: 'Success' });
});


// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

app.use(globalErrorHandler);

module.exports = app;
