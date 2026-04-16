import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create test organization
    const organization = await prisma.organization.upsert({
        where: { id: 'test-org-1' },
        update: {},
        create: {
            id: 'test-org-1',
            name: 'ABC Fuel Corporation',
            subscriptionPlan: 'professional',
            subscriptionStatus: 'trial',
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
    });

    console.log('✅ Created organization:', organization.name);

    // Create test station
    const station = await prisma.station.upsert({
        where: { id: 'test-station-1' },
        update: {},
        create: {
            id: 'test-station-1',
            organizationId: organization.id,
            name: 'Karachi North Branch',
            businessType: 'HYBRID',
            address: 'Main Highway, Karachi, Pakistan',
            isActive: true,
        },
    });

    console.log('✅ Created station:', station.name);

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@abcfuel.com' },
        update: {},
        create: {
            email: 'admin@abcfuel.com',
            passwordHash,
            fullName: 'Admin User',
            role: 'admin',
            organizationId: organization.id,
            stationId: station.id,
            isActive: true,
        },
    });

    console.log('✅ Created admin user:', adminUser.email);

    // Create some sample fuel tanks
    await prisma.fuelTank.createMany({
        data: [
            {
                stationId: station.id,
                tankNumber: 1,
                fuelType: 'PETROL',
                capacity: 40000,
                currentStock: 25000,
                reorderLevel: 10000,
            },
            {
                stationId: station.id,
                tankNumber: 2,
                fuelType: 'DIESEL',
                capacity: 50000,
                currentStock: 30000,
                reorderLevel: 15000,
            },
        ],
        skipDuplicates: true,
    });

    console.log('✅ Created fuel tanks');

    // Create sample lube products
    await prisma.lubeProduct.createMany({
        data: [
            {
                stationId: station.id,
                productId: 'SHELL-HX7-5W40',
                name: 'Shell Helix HX7 5W-40',
                brand: 'Shell',
                category: 'Engine Oil',
                unit: 'LITER',
                costPrice: 1200,
                salePrice: 1500,
                currentStock: 50,
                reorderLevel: 10,
            },
            {
                stationId: station.id,
                productId: 'MOBIL-1-5W30',
                name: 'Mobil 1 5W-30',
                brand: 'Mobil',
                category: 'Engine Oil',
                unit: 'LITER',
                costPrice: 1400,
                salePrice: 1800,
                currentStock: 30,
                reorderLevel: 10,
            },
        ],
        skipDuplicates: true,
    });

    console.log('✅ Created lube products');

    // Create sample customer
    await prisma.customer.create({
        data: {
            organizationId: organization.id,
            customerId: 'CUST-001',
            name: 'Karachi Transport Ltd',
            phone: '+92-300-1234567',
            email: 'info@karachitransport.com',
            customerType: 'fleet',
            creditLimit: 500000,
            currentBalance: 0,
        },
    });

    console.log('✅ Created sample customer');

    console.log('');
    console.log('🎉 Seeding completed!');
    console.log('');
    console.log('📝 Test Login Credentials:');
    console.log('   Email: admin@abcfuel.com');
    console.log('   Password: admin123');
    console.log('');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async e => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
