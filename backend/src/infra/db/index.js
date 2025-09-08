/*
* Instância do cliente Prisma. Este módulo encapsula a conexão
* com o banco de dados. Importar este módulo várias vezes reutilizará a
* mesma instância PrismaClient, em conformidade com as melhores práticas do Prisma.
*/
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
