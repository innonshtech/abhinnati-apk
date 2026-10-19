import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/admin-auth';
import AdminDashboardClient from './AdminDashboardClient';

// Disable caching for this route so data is always live from Supabase
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  // 1. Verify admin session
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  // 2. Fetch all real data in parallel from Supabase
  const [
    pendingVendors,
    totalApproved,
    totalVendors,
    totalUsers,
    allUsers,
    categories,
    areas,
    communityPosts,
    bookings,
    totalBookings,
  ] = await Promise.all([
    prisma.vendor.findMany({
      where: { kycStatus: 'pending' },
      include: {
        user: true,
        business: true,
        kycDocuments: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vendor.count({
      where: { kycStatus: 'approved' },
    }),
    prisma.vendor.count(),
    prisma.user.count(),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        language: true,
        isActive: true,
        createdAt: true,
        vendorProfile: {
          select: {
            id: true,
            kycStatus: true,
            business: {
              select: {
                nameEn: true,
                nameMr: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { subCategories: true },
    }),
    (async () => {
      const areaDelegate = (prisma as any).area;
      if (!areaDelegate?.findMany) return [];
      try {
        return await areaDelegate.findMany({
          orderBy: { nameEn: 'asc' },
          include: { aliases: true },
        });
      } catch (error) {
        console.warn('[admin] Area query skipped:', error);
        return [];
      }
    })(),
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { comments: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            business: {
              select: {
                id: true,
                nameEn: true,
                nameMr: true,
                whatsappNumber: true,
                logoUrl: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            nameEn: true,
            nameMr: true,
            price: true,
          },
        },
      },
    }),
    prisma.booking.count(),
  ]);

  const stats = {
    pending: pendingVendors.length,
    approved: totalApproved,
    totalVendors,
    totalUsers,
    totalCategories: categories.length,
    totalPosts: communityPosts.length,
    totalBookings,
  };

  // Pass live Supabase data and admin profile to client component
  return (
    <AdminDashboardClient
      adminUser={admin}
      initialVendors={pendingVendors}
      initialUsers={allUsers}
      initialCategories={categories}
      initialAreas={areas}
      initialPosts={communityPosts}
      initialBookings={bookings}
      stats={stats}
    />
  );
}
