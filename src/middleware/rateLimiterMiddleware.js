import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const createLimiter = ({
  maxAttempts = 5,
  windowMs = 1 * 60 * 1000,
  message = 'Too many attempts, try again later.'
} = {}) => {
  return rateLimit({
    windowMs: windowMs, 
    max: maxAttempts,
    keyGenerator: (req) => req.body.student_id || req.body.admin_id || ipKeyGenerator(req),
    message,
    standardHeaders: true,  
    legacyHeaders: false,   
    skipSuccessfulRequests: true, 
    handler: (req, res) => {
      return res.status(429).json({
        message,
        code: "RATE_LIMIT_EXCEEDED"
      });
    },
  });
};

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, 

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message: "Too many requests. Please try again later.",
    code: "RATE_LIMITED",
  },

  keyGenerator: (req) => {
    return req.user?.id || ipKeyGenerator(req); 
  },
});

// import { RateLimiterMemory } from 'rate-limiter-flexible';

// export const createLimiter = ({
//   maxAttempts = 5,
//   windowSeconds = 1 * 60,
//   message = 'Too many requests. Please try again later.'
// } = {}) => {
//   const limiter = new RateLimiterMemory({
//     points: maxAttempts,
//     duration: windowSeconds,
//     blockDuration: windowSeconds,
//   });

//   return async (req, res, next) => {
//     const key = req.body.student_id || req.body.admin_id || req.ip;

//     try {
//       const rlRes = await limiter.consume(key);

//       res.set('X-RateLimit-Limit', maxAttempts);
//       res.set('X-RateLimit-Remaining', Math.max(rlRes.remainingPoints, 0));

//       next();
//     } catch (rejRes) {
//       const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
//       const resetTime = new Date(Date.now() + rejRes.msBeforeNext);

//       res.set('Retry-After', retryAfter);
//       res.set('X-RateLimit-Limit', maxAttempts);
//       res.set('X-RateLimit-Remaining', 0);
//       res.set('X-RateLimit-Reset', resetTime.toISOString());

//       res.status(429).json({ 
//         message,
//         retryAfter,
//         resetTime: resetTime.toLocaleString() 
//       });
//     }
//   };
// };
