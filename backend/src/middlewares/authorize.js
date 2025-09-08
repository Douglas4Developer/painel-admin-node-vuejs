/*
* Middleware de autorização. Garante que o usuário autenticado tenha pelo menos
* uma das funções necessárias. Busca funções no banco de dados.
*/
const prisma = require('../infra/db');

function authorize(requiredRoles = []) {
  return async (req, res, next) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { include: { role: true } } },
      });
      const userRoleNames = user.roles.map((ur) => ur.role.name);
      const hasRequired = requiredRoles.some((role) => userRoleNames.includes(role));
      if (!hasRequired) {
        return res.status(403).json({ code: 'FORBIDDEN', message: 'Insufficient privileges' });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { authorize };