/*
* Middleware limitador de taxa para endpoint de login. Utiliza o
* pacote rate-limiter-flexible para limitar o número de tentativas de login com falha
* a partir de um único IP. Isso ajuda a mitigar ataques de força bruta.
*/
const { RateLimiterMemory } = require('rate-limiter-flexible');

const maxWrongAttemptsByIPPerPeriod = parseInt(process.env.RATE_LIMIT_MAX, 10) || 5;
const durationInSeconds = parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60;

const rateLimiter = new RateLimiterMemory({
  points: maxWrongAttemptsByIPPerPeriod,
  duration: durationInSeconds,
});

function loginRateLimiter(req, res, next) {
  const ipAddr = req.ip;
  rateLimiter.consume(ipAddr)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({ code: 'TOO_MANY_REQUESTS', message: 'Muitas tentativas de login. Tente novamente mais tarde.' });
    });
}

module.exports = { loginRateLimiter };
