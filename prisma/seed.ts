import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    'org.read',
    'org.update',
    'members.invite',
    'members.remove',
  ];

  for (const key of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  const mappings = [
    { role: 'owner', permission: 'org.update' },
    { role: 'owner', permission: 'members.invite' },
    { role: 'owner', permission: 'members.remove' },

    { role: 'admin', permission: 'members.invite' },
  ];

  for (const map of mappings) {
    await prisma.orgRolePermission.upsert({
      where: {
        role_permission: {
          role: map.role,
          permission: map.permission,
        },
      },
      update: {},
      create: map,
    });
  }
}

main();
