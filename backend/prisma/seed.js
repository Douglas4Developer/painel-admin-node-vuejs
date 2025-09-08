/*
 * Seed script para popular a base com papéis e alguns usuários.
 * Rode com: npm run seed
 */
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upsertRoles() {
  const roles = [
    { name: 'admin', description: 'Administrador(a)' },
    { name: 'user', description: 'Usuário padrão' },
    { name: 'gerente', description: 'Gestão e coordenação' },
    { name: 'vendas', description: 'Equipe de vendas' },
    { name: 'suporte', description: 'Atendimento e suporte' },
    { name: 'financeiro', description: 'Financeiro' },
    { name: 'rh', description: 'Recursos Humanos' },
  ];

  await Promise.all(
    roles.map((role) => prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    })),
  );

  // Retorna um map { name -> id } para facilitar
  const all = await prisma.role.findMany({ select: { id: true, name: true } });
  return Object.fromEntries(all.map((r) => [r.name, r.id]));
}

async function upsertAdmin(roleIdsMap) {
  const password = 'admin123'; // ajuste se quiser usar env
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      // garante ativo e com hash atualizado (opcional)
      isActive: true,
      passwordHash,
    },
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      isActive: true,
      passwordHash,
    },
  });

  // Vincula os papéis do admin (admin + user), sem duplicar
  await prisma.userRole.createMany({
    data: [
      { userId: admin.id, roleId: roleIdsMap.admin },
      { userId: admin.id, roleId: roleIdsMap.user },
    ],
    skipDuplicates: true,
  });

  return { admin, password };
}

async function upsertExampleUsers(roleIdsMap) {
  const users = [
    {
      name: 'João Vendas',
      email: 'joao.vendas@example.com',
      isActive: true,
      roles: ['vendas', 'user'],
    },
    {
      name: 'Maria Suporte',
      email: 'maria.suporte@example.com',
      isActive: true,
      roles: ['suporte', 'user'],
    },
    {
      // INATIVO para testar listagem
      name: 'Paula Inativa',
      email: 'paula.inativa@example.com',
      isActive: false,
      roles: ['user'],
    },
    {
      // INATIVO para testar listagem
      name: 'Carlos Financeiro (Inativo)',
      email: 'carlos.financeiro@example.com',
      isActive: false,
      roles: ['financeiro'],
    },
  ];

  //   senha padrão nos exemplos
  const commonPassHash = await bcrypt.hash('senha123', 10);

  await Promise.all(
    users.map(async (u) => {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          isActive: u.isActive,
          // manter o hash consistente nas rodadas do seed é opcional;
          // comentar a linha abaixo se não quiser sobrescrever:
          passwordHash: commonPassHash,
        },
        create: {
          name: u.name,
          email: u.email,
          isActive: u.isActive,
          passwordHash: commonPassHash,
        },
      });

      const roleIds = u.roles
        .map((rn) => roleIdsMap[rn])
        .filter(Boolean)
        .map((roleId) => ({ userId: user.id, roleId }));

      if (roleIds.length) {
        await prisma.userRole.createMany({ data: roleIds, skipDuplicates: true });
      }
    }),
  );
}

async function main() {
  const roleIdsMap = await upsertRoles();
  const { password } = await upsertAdmin(roleIdsMap);
  await upsertExampleUsers(roleIdsMap);

  console.log('✅ Seed concluído.\n');
  console.log('🔐 Admin:');
  console.log('  email:    admin@example.com');
  console.log(`  password: ${password}`);
  console.log('\n👤 Exemplos criados:');
  console.log('  joao.vendas@example.com (ativo)');
  console.log('  maria.suporte@example.com (ativo)');
  console.log('  paula.inativa@example.com (INATIVO)');
  console.log('  carlos.financeiro@example.com (INATIVO)');
}

main()
  .catch((e) => {
    console.error('Seed falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
