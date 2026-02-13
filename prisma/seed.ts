import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ---- Permissions ----
  const permissions = [
    'org.read',
    'org.update',
    'members.read',
    'members.invite',
    'members.remove',
    'members.updateRole',
  ];

  for (const key of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  // ---- Role → Permission mappings ----
  const mappings: { role: 'owner' | 'admin' | 'member'; permission: string }[] = [
    // OWNER: full control
    { role: 'owner', permission: 'org.read' },
    { role: 'owner', permission: 'org.update' },
    { role: 'owner', permission: 'members.read' },
    { role: 'owner', permission: 'members.invite' },
    { role: 'owner', permission: 'members.remove' },
    { role: 'owner', permission: 'members.updateRole' },

    // ADMIN: manage members, but not org ownership
    { role: 'admin', permission: 'org.read' },
    { role: 'admin', permission: 'members.read' },
    { role: 'admin', permission: 'members.invite' },
    { role: 'admin', permission: 'members.updateRole' },

    // MEMBER: read-only
    { role: 'member', permission: 'org.read' },
    { role: 'member', permission: 'members.read' },
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
      create: {
        role: map.role as 'owner' | 'admin' | 'member',
        permission: map.permission,
      },
    });
  }
}

main()
  .then(() => {
    console.log('🌱 Seed completed');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
