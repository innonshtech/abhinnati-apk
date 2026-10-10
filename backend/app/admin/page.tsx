import { PrismaClient } from '@prisma/client';
import AdminDashboardClient from './AdminDashboardClient';

const prisma = new PrismaClient();

// Disable caching for this route so data is always fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  // Fetch pending vendors and stats directly from the database on the server
  const [pendingVendors, totalApproved, totalVendors] = await Promise.all([
    prisma.vendor.findMany({
      where: { kycStatus: 'pending' },
      include: {
        user: true,
        business: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vendor.count({
      where: { kycStatus: 'approved' }
    }),
    prisma.vendor.count()
  ]);

  const stats = {
    pending: pendingVendors.length,
    approved: totalApproved,
    total: totalVendors
  };

  // Pass data to the client component for interactivity
  return <AdminDashboardClient initialVendors={pendingVendors} stats={stats} />;
}
