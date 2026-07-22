const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n===============================================================');
  console.log('                 SOLVEPAY USER MANAGEMENT TABLE                ');
  console.log('===============================================================\n');

  const users = await prisma.user.findMany({
    include: {
      wallet: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (users.length === 0) {
    console.log('No users found in database.');
    return;
  }

  const tableData = users.map((u) => ({
    'APP ID': u.appId,
    USERNAME: u.username,
    PHONE: u.phone,
    'REFERRAL CODE': u.referralCode,
    'WALLET BALANCE': u.wallet ? `₹${u.wallet.balance}` : '₹0.00',
    REGISTERED: u.createdAt.toISOString().split('T')[0],
  }));

  console.table(tableData);
  console.log(`\nTotal Users Registered: ${users.length}\n`);
}

main()
  .catch((e) => {
    console.error('Error fetching users:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
