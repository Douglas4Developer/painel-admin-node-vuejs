/*
* Fábrica de middleware de validação usando Zod. Passe um esquema para gerar
* um middleware que valida req.body em relação ao esquema. Se
* a validação falhar, passa um erro formatado para o manipulador de erros.
*/
const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }))
        });
      } else {
        next(err);
      }
    }
  };
}

module.exports = { validate };
