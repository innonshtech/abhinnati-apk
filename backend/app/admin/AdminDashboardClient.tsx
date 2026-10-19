'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';
import {
  ShieldCheck,
  CheckCircle,
  Users,
  FileText,
  LayoutDashboard,
  Settings,
  Clock,
  Search,
  LogOut,
  ExternalLink,
  X,
  AlertCircle,
  FolderTree,
  Trash2,
  Heart,
  MessageSquare,
  ShieldAlert,
  Power,
  Eye,
  Check,
  Utensils,
  Scissors,
  Sparkles,
  Wrench,
  HelpCircle,
  Plus,
  CalendarCheck,
  CreditCard,
  Car,
  Zap,
  Briefcase,
  ShoppingBag,
  Droplets,
  Paintbrush,
  Truck,
  TrendingUp,
  Percent,
  Star,
  MapPin,
} from 'lucide-react';

interface Props {
  adminUser: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    role: string;
  };
  initialVendors: any[];
  initialUsers: any[];
  initialCategories: any[];
  initialAreas?: any[];
  initialPosts: any[];
  initialBookings?: any[];
  stats: {
    pending: number;
    approved: number;
    totalVendors: number;
    totalUsers: number;
    totalCategories: number;
    totalPosts: number;
    totalBookings?: number;
  };
}

export default function AdminDashboardClient({
  adminUser,
  initialVendors,
  initialUsers,
  initialCategories,
  initialAreas = [],
  initialPosts,
  initialBookings = [],
  stats: initialStats,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'kyc' | 'users' | 'bookings' | 'categories' | 'areas' | 'moderation' | 'analytics' | 'settings'>('kyc');

  // Live state
  const [vendors, setVendors] = useState(initialVendors);
  const [users, setUsers] = useState(initialUsers);
  const [categories, setCategories] = useState(initialCategories);
  const [areas, setAreas] = useState(initialAreas);
  const [newAreaNameEn, setNewAreaNameEn] = useState('');
  const [newAreaNameMr, setNewAreaNameMr] = useState('');
  const [newAreaCity, setNewAreaCity] = useState('');
  const [newAreaLat, setNewAreaLat] = useState('');
  const [newAreaLng, setNewAreaLng] = useState('');
  const [isCreatingArea, setIsCreatingArea] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [bookings, setBookings] = useState<any[]>(initialBookings);
  const [stats, setStats] = useState(initialStats);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'resident' | 'vendor' | 'admin'>('all');

  // Bookings Filters
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingPaymentFilter, setBookingPaymentFilter] = useState<string>('all');

  // Add Category Modal State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameMr, setNewCatNameMr] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');
  const [newCatOrder, setNewCatOrder] = useState<string>('0');
  const [newCatRequiresFssai, setNewCatRequiresFssai] = useState(false);
  const [categoryFormError, setCategoryFormError] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Modals
  const [inspectVendor, setInspectVendor] = useState<any | null>(null);
  const [rejectingVendor, setRejectingVendor] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  // Vendor 360 Profile State
  const [selectedVendorFor360, setSelectedVendorFor360] = useState<string | null>(null);
  const [vendor360Data, setVendor360Data] = useState<any | null>(null);
  const [loadingVendor360, setLoadingVendor360] = useState(false);

  // 1. Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('/api/v1/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Approve Vendor Handler
  const handleApprove = async (vendorId: string) => {
    setProcessing(vendorId);
    try {
      const res = await fetch(`/api/v1/admin/approve-vendor/${vendorId}`, {
        method: 'POST',
      });

      if (res.ok) {
        setVendors((prev) => prev.filter((v) => v.id !== vendorId));
        setStats((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          approved: prev.approved + 1,
        }));
        if (inspectVendor?.id === vendorId) setInspectVendor(null);
      } else {
        alert('Failed to approve vendor');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while approving');
    } finally {
      setProcessing(null);
    }
  };

  // 3. Reject Vendor Handler
  const handleConfirmReject = async () => {
    if (!rejectingVendor) return;
    const vendorId = rejectingVendor.id;
    setProcessing(vendorId);

    try {
      const res = await fetch(`/api/v1/admin/reject-vendor/${vendorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (res.ok) {
        setVendors((prev) => prev.filter((v) => v.id !== vendorId));
        setStats((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
        }));
        setRejectingVendor(null);
        setRejectionReason('');
        if (inspectVendor?.id === vendorId) setInspectVendor(null);
      } else {
        alert('Failed to reject vendor');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while rejecting');
    } finally {
      setProcessing(null);
    }
  };

  // 4. Toggle User Status (Active / Suspended)
  const handleToggleUserStatus = async (userId: string, currentActive: boolean) => {
    setProcessing(userId);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !currentActive } : u))
        );
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update user status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating user');
    } finally {
      setProcessing(null);
    }
  };

  // 5. Delete Community Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to remove this post from the neighbourhood feed?')) return;
    setProcessing(postId);

    try {
      const res = await fetch(`/api/v1/admin/community/posts/${postId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setStats((prev) => ({ ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) }));
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error(err);
      alert('Network error deleting post');
    } finally {
      setProcessing(null);
    }
  };

  // 6. Toggle Category Active Status
  const handleToggleCategory = async (catId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/categories/${catId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === catId ? { ...c, isActive: !currentActive } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Add New Category Handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFormError('');

    if (!newCatNameEn.trim() || !newCatNameMr.trim()) {
      setCategoryFormError('Please enter both English and Marathi category names.');
      return;
    }

    setIsCreatingCategory(true);
    try {
      const res = await fetch('/api/v1/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn: newCatNameEn.trim(),
          nameMr: newCatNameMr.trim(),
          iconName: newCatIcon,
          displayOrder: Number(newCatOrder) || 0,
          requiresFssai: newCatRequiresFssai,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCategoryFormError(data.error || 'Failed to create category');
        return;
      }

      setCategories((prev) => [...prev, data.category]);
      setStats((prev) => ({
        ...prev,
        totalCategories: (prev.totalCategories || 0) + 1,
      }));

      setNewCatNameEn('');
      setNewCatNameMr('');
      setNewCatIcon('Sparkles');
      setNewCatOrder('0');
      setNewCatRequiresFssai(false);
      setShowAddCategoryModal(false);
    } catch (err: any) {
      console.error(err);
      setCategoryFormError(err.message || 'Error creating category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaNameEn.trim()) return;
    setIsCreatingArea(true);
    try {
      const res = await fetch('/api/v1/admin/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn: newAreaNameEn.trim(),
          nameMr: newAreaNameMr.trim() || newAreaNameEn.trim(),
          city: newAreaCity.trim(),
          latitude: Number(newAreaLat) || 0,
          longitude: Number(newAreaLng) || 0,
        }),
      });
      const data = await res.json();
      if (res.ok && data.area) {
        setAreas((prev) => [...prev, data.area].sort((a, b) => (a.nameEn || '').localeCompare(b.nameEn || '')));
        setNewAreaNameEn('');
        setNewAreaNameMr('');
        setNewAreaCity('');
        setNewAreaLat('');
        setNewAreaLng('');
      } else {
        alert(data.error || 'Failed to create area');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create area');
    } finally {
      setIsCreatingArea(false);
    }
  };

  const handleToggleArea = async (areaId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/areas/${areaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setAreas((prev) => prev.map((area) => (area.id === areaId ? { ...area, isActive: !currentActive } : area)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    if (!confirm('Remove this operational area from the app?')) return;
    try {
      const res = await fetch(`/api/v1/admin/areas/${areaId}`, { method: 'DELETE' });
      if (res.ok) {
        setAreas((prev) => prev.filter((area) => area.id !== areaId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Inspect Vendor 360 Profile & Analytics
  const handleInspectVendor360 = async (vendorOrUserId: string) => {
    setSelectedVendorFor360(vendorOrUserId);
    setLoadingVendor360(true);
    setVendor360Data(null);
    try {
      const res = await fetch(`/api/v1/admin/vendors/${vendorOrUserId}/profile`);
      const data = await res.json();
      if (res.ok && data.success) {
        setVendor360Data(data);
      }
    } catch (err) {
      console.error('Failed to load vendor 360 profile:', err);
    } finally {
      setLoadingVendor360(false);
    }
  };

  // Helper for category icons
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'utensils':
        return <Utensils size={20} />;
      case 'scissors':
        return <Scissors size={20} />;
      case 'sparkles':
        return <Sparkles size={20} />;
      case 'wrench':
        return <Wrench size={20} />;
      case 'car':
        return <Car size={20} />;
      case 'zap':
        return <Zap size={20} />;
      case 'briefcase':
        return <Briefcase size={20} />;
      case 'shoppingbag':
        return <ShoppingBag size={20} />;
      case 'droplets':
        return <Droplets size={20} />;
      case 'paintbrush':
        return <Paintbrush size={20} />;
      case 'truck':
        return <Truck size={20} />;
      case 'heart':
        return <Heart size={20} />;
      default:
        return <HelpCircle size={20} />;
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.phone?.includes(userSearch) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      bookingSearch === '' ||
      b.id?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.user?.phone?.includes(bookingSearch) ||
      b.vendor?.business?.nameEn?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.vendor?.business?.nameMr?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.service?.nameEn?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.service?.nameMr?.toLowerCase().includes(bookingSearch.toLowerCase());

    const matchesStatus =
      bookingStatusFilter === 'all' || b.status?.toLowerCase() === bookingStatusFilter.toLowerCase();

    const matchesPayment =
      bookingPaymentFilter === 'all' || b.paymentStatus?.toLowerCase() === bookingPaymentFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className={styles.container}>
      {/* ===================== SIDEBAR NAVIGATION ===================== */}
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.logo}>
            <ShieldCheck size={32} color="#1D4ED8" strokeWidth={2.5} />
            Abhinnati Admin
          </div>

          <nav className={styles.nav}>
            <div
              className={`${styles.navItem} ${activeTab === 'kyc' ? styles.active : ''}`}
              onClick={() => setActiveTab('kyc')}
            >
              <CheckCircle size={19} />
              <span>KYC Approvals</span>
              {vendors.length > 0 && <span className={styles.navBadge}>{vendors.length}</span>}
            </div>

            <div
              className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={19} />
              <span>User Management</span>
            </div>

            <div
              className={`${styles.navItem} ${activeTab === 'bookings' ? styles.active : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <CalendarCheck size={19} />
              <span>Bookings Overview</span>
              {bookings.length > 0 && <span className={styles.navBadge}>{bookings.length}</span>}
            </div>

            <div
              className={`${styles.navItem} ${activeTab === 'categories' ? styles.active : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <FolderTree size={19} />
              <span>Categories</span>
            </div>

            <div
              className={`${styles.navItem} ${activeTab === 'areas' ? styles.active : ''}`}
              onClick={() => setActiveTab('areas')}
            >
              <MapPin size={19} />
              <span>Areas</span>
            </div>

            <div
              className={`${styles.navItem} ${activeTab === 'moderation' ? styles.active : ''}`}
              onClick={() => setActiveTab('moderation')}
            >
              <FileText size={19} />
              <span>Content Moderation</span>
            </div>

            <div
              className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <LayoutDashboard size={19} />
              <span>System Analytics</span>
            </div>

            <div
              className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={19} />
              <span>Settings</span>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer with Logged In Profile */}
        <div className={styles.sidebarFooter}>
          <div className={styles.adminProfile}>
            <div className={styles.adminAvatar}>
              {adminUser.name?.charAt(0) || 'A'}
            </div>
            <div className={styles.adminInfo}>
              <div className={styles.adminName}>{adminUser.name || 'System Admin'}</div>
              <div className={styles.adminRole}>{adminUser.phone}</div>
            </div>
          </div>
          <button className={styles.btnLogout} onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT PANELS ===================== */}
      <main className={styles.mainContent}>
        {/* ----------------- TAB 1: KYC APPROVALS ----------------- */}
        {activeTab === 'kyc' && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Vendor KYC Approvals</h1>
              <p className={styles.subtitle}>Review identity documents and verify business registrations from the mobile app.</p>
            </header>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Pending Reviews</div>
                <div className={styles.statValue} style={{ color: '#D97706' }}>{stats.pending}</div>
                <Clock size={24} color="#D97706" style={{ position: 'absolute', right: 24, top: 24, opacity: 0.2 }} />
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Approved Vendors</div>
                <div className={styles.statValue} style={{ color: '#059669' }}>{stats.approved}</div>
                <CheckCircle size={24} color="#059669" style={{ position: 'absolute', right: 24, top: 24, opacity: 0.2 }} />
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Registrations</div>
                <div className={styles.statValue}>{stats.totalVendors}</div>
                <Users size={24} color="#3B82F6" style={{ position: 'absolute', right: 24, top: 24, opacity: 0.2 }} />
              </div>
            </div>
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h2 className={styles.tableTitle}>Pending Verification Queue</h2>
              </div>

              {vendors.length === 0 ? (
                <div className={styles.emptyState}>
                  <CheckCircle size={48} className={styles.emptyIcon} />
                  <h3>All Caught Up!</h3>
                  <p>There are no pending vendor registrations to review right now.</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Business & Vendor</th>
                      <th>Category</th>
                      <th>Contact Info</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor) => (
                      <tr key={vendor.id}>
                        <td>
                          <div className={styles.vendorInfo}>
                            <div className={styles.avatar}>
                              {vendor.business?.nameEn?.charAt(0) || vendor.user?.name?.charAt(0) || 'B'}
                            </div>
                            <div>
                              <div className={styles.vendorName}>{vendor.business?.nameEn || 'Unregistered Business'}</div>
                              <div className={styles.vendorBusiness}>{vendor.user?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>{vendor.business?.nameMr || 'General'}</td>
                        <td>{vendor.user?.phone}</td>
                        <td>
                          <span className={`${styles.badge} ${styles.pending}`}>
                            <Clock size={13} /> Pending Review
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionCell}>
                            <button
                              className={styles.btnInspect}
                              onClick={() => setInspectVendor(vendor)}
                            >
                              <Eye size={14} />
                              <span>Inspect</span>
                            </button>
                            <button
                              className={styles.btnApprove}
                              onClick={() => handleApprove(vendor.id)}
                              disabled={processing === vendor.id}
                            >
                              {processing === vendor.id ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              className={styles.btnReject}
                              onClick={() => {
                                setRejectingVendor(vendor);
                                setRejectionReason('');
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ----------------- TAB 2: USER MANAGEMENT ----------------- */}
        {activeTab === 'users' && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>User Management</h1>
              <p className={styles.subtitle}>Complete directory of residents, verified vendors, and system administrators.</p>
            </header>

            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <div className={styles.filterPills}>
                  {(['all', 'resident', 'vendor', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      className={`${styles.pill} ${userRoleFilter === role ? styles.active : ''}`}
                      onClick={() => setUserRoleFilter(role)}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>

                <div className={styles.searchBox}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by name or phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone / Contact</th>
                    <th>Role</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div
                          className={styles.vendorInfo}
                          style={user.role === 'vendor' ? { cursor: 'pointer' } : {}}
                          onClick={() => {
                            if (user.role === 'vendor') {
                              handleInspectVendor360(user.vendorProfile?.id || user.id);
                            }
                          }}
                        >
                          <div className={styles.avatar}>
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className={styles.vendorName}>
                              {user.name || 'Unnamed User'}
                              {user.role === 'vendor' && user.vendorProfile?.business?.nameEn && (
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#1D4ED8', marginLeft: 6 }}>
                                  ({user.vendorProfile.business.nameEn})
                                </span>
                              )}
                            </div>
                            <div className={styles.vendorBusiness}>
                              {user.email || `ID: ${user.id.slice(0, 8)}...`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[user.role] || styles.resident}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.language === 'mr' ? 'मराठी' : 'English'}</td>
                      <td>
                        <span className={`${styles.badge} ${user.isActive ? styles.approved : styles.rejected}`}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {user.role === 'vendor' && (
                            <button
                              className={styles.btnInspect360}
                              onClick={() => handleInspectVendor360(user.vendorProfile?.id || user.id)}
                              title="Inspect Vendor 360 Profile, Services Catalog, and Performance"
                            >
                              <Eye size={14} />
                              Vendor 360
                            </button>
                          )}
                          <button
                            className={`${styles.btnToggleStatus} ${user.isActive ? styles.active : styles.suspended}`}
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            disabled={processing === user.id || user.id === adminUser.id}
                          >
                            {user.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ----------------- TAB 3: BOOKINGS OVERVIEW ----------------- */}
        {activeTab === 'bookings' && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Bookings & Orders Overview</h1>
              <p className={styles.subtitle}>
                Real-time tracking of customer requests, scheduling slots, and payments across all registered businesses in Maharashtra.
              </p>
            </header>

            {/* Metrics cards */}
            <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Total Bookings</span>
                  <div className={styles.statIcon} style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                    <CalendarCheck size={20} />
                  </div>
                </div>
                <div className={styles.statValue}>{bookings.length}</div>
                <div className={styles.statSub}>Across all services</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Completed</span>
                  <div className={styles.statIcon} style={{ background: '#DCFCE7', color: '#15803D' }}>
                    <CheckCircle size={20} />
                  </div>
                </div>
                <div className={styles.statValue}>
                  {bookings.filter((b) => b.status === 'completed').length}
                </div>
                <div className={styles.statSub}>Fulfilled orders</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Pending Action</span>
                  <div className={styles.statIcon} style={{ background: '#FEF3C7', color: '#B45309' }}>
                    <Clock size={20} />
                  </div>
                </div>
                <div className={styles.statValue}>
                  {bookings.filter((b) => b.status === 'pending').length}
                </div>
                <div className={styles.statSub}>Awaiting vendor acceptance</div>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <div className={styles.filterBar}>
                <div className={styles.filterPills}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginRight: 4 }}>Status:</span>
                  {['all', 'pending', 'accepted', 'completed', 'declined', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      className={`${styles.filterPill} ${bookingStatusFilter === st ? styles.filterPillActive : ''}`}
                      onClick={() => setBookingStatusFilter(st)}
                    >
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>

                <div className={styles.searchBox}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by ID, customer, vendor..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                  />
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className={styles.emptyState}>
                  <CalendarCheck size={48} className={styles.emptyIcon} />
                  <h3>No Bookings Found</h3>
                  <p>There are no customer orders matching the current filter criteria.</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Booking Ref / Slot</th>
                      <th>Customer</th>
                      <th>Vendor / Shop</th>
                      <th>Service Details</th>
                      <th>Service Status</th>
                      <th>Payment Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => {
                      const statusClass =
                        b.status === 'completed'
                          ? styles.statusCompleted
                          : b.status === 'accepted'
                          ? styles.statusAccepted
                          : b.status === 'cancelled'
                          ? styles.statusCancelled
                          : styles.statusPending;

                      const paymentClass =
                        b.paymentStatus === 'paid'
                          ? styles.paymentPaid
                          : b.paymentStatus === 'failed'
                          ? styles.paymentFailed
                          : styles.paymentPending;

                      return (
                        <tr key={b.id}>
                          <td>
                            <div className={styles.bookingMetaCell}>
                              <span className={styles.bookingIdTag}>#{b.id.slice(0, 8).toUpperCase()}</span>
                              <div className={styles.bookingSlot}>
                                <Clock size={12} />
                                {b.bookingDate || 'Flexible'} {b.bookingTime ? `@ ${b.bookingTime}` : ''}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={styles.partyName}>{b.user?.name || 'Customer'}</div>
                            <div className={styles.partySub}>{b.user?.phone || 'No phone'}</div>
                          </td>
                          <td>
                            <div className={styles.partyName}>
                              {b.vendor?.business?.nameEn || b.vendor?.business?.nameMr || 'Vendor Partner'}
                            </div>
                            <div className={styles.partySub}>
                              {b.vendor?.user?.phone || 'Shop Phone N/A'}
                            </div>
                          </td>
                          <td>
                            <div className={styles.partyName}>
                              {b.service?.nameEn || b.service?.nameMr || 'Custom Service'}
                            </div>
                            {b.notes && (
                              <div className={styles.partySub} style={{ fontStyle: 'italic' }}>
                                &ldquo;{b.notes.slice(0, 35)}...&rdquo;
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${statusClass}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <span className={styles.badge} style={{ background: '#F1F5F9', color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>
                              {b.paymentMethod || 'COD'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ----------------- TAB 4: CATEGORIES ----------------- */}
        {activeTab === 'categories' && (
          <>
            <div className={styles.headerWithAction}>
              <div>
                <h1 className={styles.title}>Service Categories</h1>
                <p className={styles.subtitle}>Manage local categories and Marathi/English taxonomies shown in the mobile app.</p>
              </div>
              <button
                className={styles.btnAddPrimary}
                onClick={() => {
                  setCategoryFormError('');
                  setShowAddCategoryModal(true);
                }}
              >
                <Plus size={18} />
                Add New Category
              </button>
            </div>

            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h2 className={styles.tableTitle}>Live Categories ({categories.length})</h2>
              </div>

              <div>
                {categories.map((cat) => (
                  <div key={cat.id} className={styles.catRow}>
                    <div className={styles.catInfo}>
                      <div className={styles.catIconBox}>
                        {renderCategoryIcon(cat.iconName)}
                      </div>
                      <div>
                        <div className={styles.catNameEn}>{cat.nameEn}</div>
                        <div className={styles.catNameMr}>{cat.nameMr}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span className={`${styles.badge} ${cat.isActive ? styles.approved : styles.pending}`}>
                        {cat.isActive ? 'Active in App' : 'Disabled'}
                      </span>
                      {cat.requiresFssai && (
                        <span className={styles.badge} style={{ background: '#FEF3C7', color: '#92400E' }}>FSSAI</span>
                      )}
                      <button
                        className={styles.btnToggleStatus}
                        onClick={() => handleToggleCategory(cat.id, cat.isActive)}
                      >
                        {cat.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'areas' && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Operational Areas</h1>
              <p className={styles.subtitle}>These localities power area pickers, KYC, search, and the neighbourhood feed.</p>
            </header>

            <div className={styles.tableContainer} style={{ marginBottom: 24 }}>
              <h2 className={styles.tableTitle} style={{ marginBottom: 16 }}>Add Area</h2>
              <form onSubmit={handleCreateArea} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <input className={styles.formInput} placeholder="Name (English)" value={newAreaNameEn} onChange={(e) => setNewAreaNameEn(e.target.value)} required />
                <input className={styles.formInput} placeholder="Name (Marathi)" value={newAreaNameMr} onChange={(e) => setNewAreaNameMr(e.target.value)} />
                <input className={styles.formInput} placeholder="City" value={newAreaCity} onChange={(e) => setNewAreaCity(e.target.value)} />
                <input className={styles.formInput} placeholder="Latitude" value={newAreaLat} onChange={(e) => setNewAreaLat(e.target.value)} />
                <input className={styles.formInput} placeholder="Longitude" value={newAreaLng} onChange={(e) => setNewAreaLng(e.target.value)} />
                <button type="submit" className={styles.btnAddPrimary} disabled={isCreatingArea}>
                  <Plus size={16} />
                  {isCreatingArea ? 'Saving...' : 'Publish Area'}
                </button>
              </form>
            </div>

            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h2 className={styles.tableTitle}>Live Areas ({areas.length})</h2>
              </div>
              {areas.length === 0 ? (
                <div className={styles.emptyState}>
                  <MapPin size={48} className={styles.emptyIcon} />
                  <h3>No operational areas yet</h3>
                  <p>Add the first locality so residents and vendors can select it in the app.</p>
                </div>
              ) : (
                areas.map((area) => (
                  <div key={area.id} className={styles.catRow}>
                    <div className={styles.catInfo}>
                      <div className={styles.catIconBox}>
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className={styles.catNameEn}>{area.nameEn || area.name}</div>
                        <div className={styles.catNameMr}>{area.nameMr}{area.city ? ` · ${area.city}` : ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`${styles.badge} ${area.isActive ? styles.approved : styles.pending}`}>
                        {area.isActive ? 'Active in App' : 'Disabled'}
                      </span>
                      <button className={styles.btnToggleStatus} onClick={() => handleToggleArea(area.id, area.isActive)}>
                        {area.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button className={styles.btnDeletePost} onClick={() => handleDeleteArea(area.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ----------------- TAB 4: CONTENT MODERATION ----------------- */}
        {activeTab === 'moderation' && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Community Moderation</h1>
              <p className={styles.subtitle}>Review posts submitted by residents in the neighbourhood feed and purge spam.</p>
            </header>

            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h2 className={styles.tableTitle}>Neighbourhood Feed Posts ({posts.length})</h2>
              </div>

              {posts.length === 0 ? (
                <div className={styles.emptyState}>
                  <CheckCircle size={48} className={styles.emptyIcon} />
                  <h3>No Posts to Moderate</h3>
                  <p>The neighbourhood feed has no reported or active posts.</p>
                </div>
              ) : (
                <div>
                  {posts.map((post) => (
                    <div key={post.id} className={styles.postCard}>
                      <div className={styles.postHeader}>
                        <div>
                          <span className={styles.postAuthor}>{post.authorName}</span>
                          <span style={{ margin: '0 8px', color: '#CBD5E1' }}>•</span>
                          <span style={{ fontSize: 13, color: '#64748B' }}>Area ID: {post.areaId}</span>
                        </div>
                        <span className={styles.postTag}>{post.tag}</span>
                      </div>

                      <h3 className={styles.postTitle}>{post.titleEn || post.titleMr}</h3>
                      <p className={styles.postContent}>{post.contentEn || post.contentMr}</p>

                      <div className={styles.postFooter}>
                        <div className={styles.postStats}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Heart size={14} color="#EF4444" /> {post.likes} likes
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MessageSquare size={14} color="#3B82F6" /> {post.comments?.length || post.commentsCount} comments
                          </span>
                        </div>

                        <button
                          className={styles.btnDeletePost}
                          onClick={() => handleDeletePost(post.id)}
                          disabled={processing === post.id}
                        >
                          <Trash2 size={14} />
                          <span>Remove from Feed</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ----------------- TAB 5: SYSTEM ANALYTICS ----------------- */}
        {activeTab === 'analytics' && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>System Analytics</h1>
              <p className={styles.subtitle}>Live overview of the Abhinnati hyperlocal ecosystem.</p>
            </header>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Platform Users</div>
                <div className={styles.statValue} style={{ color: '#2563EB' }}>{stats.totalUsers}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Vendors Registered</div>
                <div className={styles.statValue} style={{ color: '#059669' }}>{stats.totalVendors}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Active Service Categories</div>
                <div className={styles.statValue} style={{ color: '#7C3AED' }}>{stats.totalCategories}</div>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <h2 className={styles.tableTitle} style={{ marginBottom: 16 }}>Platform Health & Ecosystem Breakdown</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 12 }}>
                <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Verified Vendors</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', marginTop: 4 }}>{stats.approved}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>KYC approved accounts</div>
                </div>

                <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Pending Review</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#D97706', marginTop: 4 }}>{stats.pending}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Awaiting KYC decision</div>
                </div>

                <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Orders Recorded</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>{bookings.length}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Statewide transactions</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ----------------- TAB 6: SETTINGS ----------------- */}
        {activeTab === 'settings' && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Admin Settings & Account</h1>
              <p className={styles.subtitle}>Manage your session and administrator account preferences.</p>
            </header>

            <div className={styles.tableContainer} style={{ maxWidth: 600 }}>
              <h2 className={styles.tableTitle} style={{ marginBottom: 20 }}>Administrator Profile</h2>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Name</span>
                <span className={styles.detailValue}>{adminUser.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Registered Phone</span>
                <span className={styles.detailValue}>{adminUser.phone}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{adminUser.email || 'Not configured'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Database Connection</span>
                <span className={styles.detailValue} style={{ color: '#059669' }}>Connected (Supabase Cloud)</span>
              </div>

              <div style={{ marginTop: 28 }}>
                <button
                  className={styles.btnLogout}
                  style={{ width: '100%', padding: 14, fontSize: 15 }}
                  onClick={handleLogout}
                >
                  <Power size={18} />
                  <span>Terminate Admin Session & Log Out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ===================== MODAL: INSPECT VENDOR KYC ===================== */}
      {inspectVendor && (
        <div className={styles.modalBackdrop} onClick={() => setInspectVendor(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Vendor KYC Inspection</h2>
              <button className={styles.modalClose} onClick={() => setInspectVendor(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Business (English)</span>
              <span className={styles.detailValue}>{inspectVendor.business?.nameEn || 'N/A'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Business (Marathi)</span>
              <span className={styles.detailValue}>{inspectVendor.business?.nameMr || 'N/A'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Owner / Applicant</span>
              <span className={styles.detailValue}>{inspectVendor.user?.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Phone Number</span>
              <span className={styles.detailValue}>{inspectVendor.user?.phone}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Service Radius</span>
              <span className={styles.detailValue}>{inspectVendor.serviceRadius || '5 km'}</span>
            </div>

            <div className={styles.docsSection}>
              <div className={styles.docsTitle}>Submitted Verification Documents:</div>
              {inspectVendor.kycDocuments && inspectVendor.kycDocuments.length > 0 ? (
                inspectVendor.kycDocuments.map((doc: any) => (
                  <div key={doc.id} className={styles.docItem}>
                    <span>{doc.docType ? doc.docType.replace(/_/g, ' ').toUpperCase() : 'Identity Document'}</span>
                    {doc.fileUrl ? (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                        View Document <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className={styles.badge} style={{ background: '#ECFDF5', color: '#059669' }}>
                        <Check size={12} /> Uploaded
                      </span>
                    )}
                  </div>
                ))
              ) : inspectVendor.kycDocsUrl ? (
                <div className={styles.docItem}>
                  <span>Identity Proof / Trade License</span>
                  <a href={inspectVendor.kycDocsUrl} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                    View Document <ExternalLink size={12} />
                  </a>
                </div>
              ) : (
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: 8, fontSize: 13, color: '#64748B' }}>
                  No document attachments found for this applicant.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button
                className={styles.btnApprove}
                style={{ flex: 1, padding: 12, fontSize: 14 }}
                onClick={() => handleApprove(inspectVendor.id)}
                disabled={processing === inspectVendor.id}
              >
                {processing === inspectVendor.id ? 'Approving...' : 'Approve & Unlock Vendor Mode'}
              </button>
              <button
                className={styles.btnReject}
                style={{ flex: 1, padding: 12, fontSize: 14 }}
                onClick={() => {
                  setRejectingVendor(inspectVendor);
                  setInspectVendor(null);
                }}
              >
                Reject with Reason
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: REJECT VENDOR ===================== */}
      {rejectingVendor && (
        <div className={styles.modalBackdrop} onClick={() => setRejectingVendor(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: '#E11D48', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={22} />
                Reject Vendor Registration
              </h2>
              <button className={styles.modalClose} onClick={() => setRejectingVendor(null)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#64748B', fontSize: 14, marginBottom: 16 }}>
              Provide an explanation for rejecting <b>{rejectingVendor.business?.nameEn || rejectingVendor.user?.name}</b>. This exact feedback will be displayed on the vendor's mobile screen so they can re-upload corrected documents.
            </p>

            <textarea
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                fontSize: 14,
                fontFamily: 'inherit',
                minHeight: 100,
                boxSizing: 'border-box',
                marginBottom: 20,
              }}
              placeholder="e.g. Aadhaar card photo is blurry. Please upload a clear photo showing full name and address."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className={styles.btnReject}
                style={{ flex: 1, padding: 12, fontSize: 14 }}
                onClick={handleConfirmReject}
                disabled={processing === rejectingVendor.id}
              >
                {processing === rejectingVendor.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button
                className={styles.btnInspect}
                style={{ flex: 1, padding: 12, fontSize: 14, justifyContent: 'center' }}
                onClick={() => setRejectingVendor(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: ADD NEW CATEGORY ===================== */}
      {showAddCategoryModal && (
        <div className={styles.modalBackdrop} onClick={() => !isCreatingCategory && setShowAddCategoryModal(false)}>
          <div className={styles.modalContent} style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FolderTree size={22} color="#1D4ED8" />
                Add New Service Category
              </h2>
              <button
                className={styles.modalClose}
                onClick={() => !isCreatingCategory && setShowAddCategoryModal(false)}
                disabled={isCreatingCategory}
              >
                <X size={20} />
              </button>
            </div>

            {categoryFormError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={16} />
                {categoryFormError}
              </div>
            )}

            <form onSubmit={handleCreateCategory}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category Name (English) *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Car Wash & Detailing"
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  required
                />
                <div className={styles.formHelper}>
                  Auto-generated slug: <code style={{ color: '#2563EB', fontWeight: 600 }}>
                    {newCatNameEn
                      ? newCatNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      : 'car-wash-detailing'}
                  </code>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category Name (मराठी) *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="उदा. कार धुणे आणि स्वच्छता"
                  value={newCatNameMr}
                  onChange={(e) => setNewCatNameMr(e.target.value)}
                  required
                />
                <div className={styles.formHelper}>Displayed in the Marathi interface for customers & vendors</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category Icon (Lucide)</label>
                <div className={styles.iconPickerGrid}>
                  {[
                    { name: 'Sparkles', label: 'Sparkles' },
                    { name: 'Utensils', label: 'Food' },
                    { name: 'Scissors', label: 'Salon' },
                    { name: 'Wrench', label: 'Repairs' },
                    { name: 'Car', label: 'Auto' },
                    { name: 'Zap', label: 'Electric' },
                    { name: 'Briefcase', label: 'Work' },
                    { name: 'ShoppingBag', label: 'Store' },
                    { name: 'Droplets', label: 'Plumbing' },
                    { name: 'Paintbrush', label: 'Paint' },
                    { name: 'Truck', label: 'Transport' },
                    { name: 'Heart', label: 'Health' },
                  ].map((ic) => (
                    <button
                      key={ic.name}
                      type="button"
                      className={`${styles.iconPickerItem} ${newCatIcon === ic.name ? styles.iconPickerItemSelected : ''}`}
                      onClick={() => setNewCatIcon(ic.name)}
                    >
                      {renderCategoryIcon(ic.name)}
                      <span>{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Display Order</label>
                <input
                  type="number"
                  className={styles.formInput}
                  placeholder="0"
                  value={newCatOrder}
                  onChange={(e) => setNewCatOrder(e.target.value)}
                />
                <div className={styles.formHelper}>Lower numbers appear first on the mobile app home screen</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={newCatRequiresFssai}
                    onChange={(e) => setNewCatRequiresFssai(e.target.checked)}
                  />
                  Require FSSAI document during vendor KYC
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  type="submit"
                  className={styles.btnAddPrimary}
                  style={{ flex: 1, padding: 12, justifyContent: 'center' }}
                  disabled={isCreatingCategory}
                >
                  {isCreatingCategory ? 'Creating Category...' : 'Save & Publish Category'}
                </button>
                <button
                  type="button"
                  className={styles.btnInspect}
                  style={{ flex: 1, padding: 12, justifyContent: 'center' }}
                  onClick={() => setShowAddCategoryModal(false)}
                  disabled={isCreatingCategory}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: VENDOR 360 PROFILE & PERFORMANCE ===================== */}
      {selectedVendorFor360 && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedVendorFor360(null)}>
          <div className={`${styles.modalContent} ${styles.vendor360Modal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={styles.badge} style={{ background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700 }}>
                  VENDOR 360 DOSSIER
                </span>
                {vendor360Data?.vendor?.kycStatus && (
                  <span className={`${styles.badge} ${vendor360Data.vendor.kycStatus === 'approved' ? styles.approved : styles.pending}`}>
                    KYC: {vendor360Data.vendor.kycStatus.toUpperCase()}
                  </span>
                )}
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedVendorFor360(null)}>
                <X size={20} />
              </button>
            </div>

            {loadingVendor360 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B' }}>
                <Clock size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                <p style={{ fontWeight: 600 }}>Loading Vendor 360 Performance & Catalog...</p>
              </div>
            ) : vendor360Data ? (
              <>
                {/* Shop / Partner Header */}
                <div className={styles.vendorDossierHeader}>
                  <div className={styles.vendorDossierAvatar}>
                    {vendor360Data.vendor.business?.nameEn?.charAt(0) || vendor360Data.vendor.user?.name?.charAt(0) || 'V'}
                  </div>
                  <div className={styles.vendorDossierInfo}>
                    <h3 className={styles.vendorShopName}>
                      {vendor360Data.vendor.business?.nameEn || 'Individual Vendor'}
                      {vendor360Data.vendor.business?.nameMr && (
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#64748B' }}>
                          ({vendor360Data.vendor.business.nameMr})
                        </span>
                      )}
                    </h3>
                    <div className={styles.vendorShopSub}>
                      <span><b>Owner:</b> {vendor360Data.vendor.user?.name}</span>
                      <span>•</span>
                      <span><b>Phone:</b> {vendor360Data.vendor.user?.phone}</span>
                      {vendor360Data.vendor.business?.whatsappNumber && (
                        <>
                          <span>•</span>
                          <span><b>WhatsApp:</b> {vendor360Data.vendor.business.whatsappNumber}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>⭐ {vendor360Data.vendor.business?.ratingAvg?.toFixed(1) || '4.5'} rating</span>
                    </div>
                  </div>
                </div>

                {/* KPI Performance Cards (Clickable Acceptance %, Decline %, Completed Jobs) */}
                <div className={styles.kpiGrid360}>
                  <div
                    className={`${styles.kpiCard360} ${styles.kpiCard360Clickable}`}
                    style={{ borderTop: '3px solid #16A34A' }}
                    onClick={() => {
                      const shopSearch = vendor360Data.vendor.business?.nameEn || vendor360Data.vendor.user?.name || '';
                      setBookingSearch(shopSearch);
                      setBookingStatusFilter('accepted');
                      setActiveTab('bookings');
                      setSelectedVendorFor360(null);
                    }}
                    title="Click to view accepted orders in Bookings tab"
                  >
                    <div className={styles.kpiLabel360}>Acceptance Rate</div>
                    <div className={styles.kpiValue360} style={{ color: '#16A34A' }}>
                      {vendor360Data.analytics?.acceptanceRate || 0}%
                    </div>
                    <div className={styles.kpiSub360}>
                      {vendor360Data.analytics?.acceptedCount || 0} accepted jobs
                    </div>
                    <div className={styles.kpiSub360} style={{ color: '#16A34A', fontWeight: 600, marginTop: 4 }}>
                      View Accepted List →
                    </div>
                  </div>

                  <div
                    className={`${styles.kpiCard360} ${styles.kpiCard360Clickable}`}
                    style={{ borderTop: '3px solid #DC2626' }}
                    onClick={() => {
                      const shopSearch = vendor360Data.vendor.business?.nameEn || vendor360Data.vendor.user?.name || '';
                      setBookingSearch(shopSearch);
                      setBookingStatusFilter('declined');
                      setActiveTab('bookings');
                      setSelectedVendorFor360(null);
                    }}
                    title="Click to view declined orders in Bookings tab"
                  >
                    <div className={styles.kpiLabel360}>Decline Rate</div>
                    <div className={styles.kpiValue360} style={{ color: '#DC2626' }}>
                      {vendor360Data.analytics?.declineRate || 0}%
                    </div>
                    <div className={styles.kpiSub360}>
                      {vendor360Data.analytics?.declinedCount || 0} rejected by vendor
                    </div>
                    <div className={styles.kpiSub360} style={{ color: '#DC2626', fontWeight: 600, marginTop: 4 }}>
                      View Declined List →
                    </div>
                  </div>

                  <div
                    className={`${styles.kpiCard360} ${styles.kpiCard360Clickable}`}
                    style={{ borderTop: '3px solid #2563EB' }}
                    onClick={() => {
                      const shopSearch = vendor360Data.vendor.business?.nameEn || vendor360Data.vendor.user?.name || '';
                      setBookingSearch(shopSearch);
                      setBookingStatusFilter('completed');
                      setActiveTab('bookings');
                      setSelectedVendorFor360(null);
                    }}
                    title="Click to view completed orders in Bookings tab"
                  >
                    <div className={styles.kpiLabel360}>Completed</div>
                    <div className={styles.kpiValue360} style={{ color: '#2563EB' }}>
                      {vendor360Data.analytics?.completedCount || 0}
                    </div>
                    <div className={styles.kpiSub360}>
                      out of {vendor360Data.analytics?.totalRequests || 0} total requests
                    </div>
                    <div className={styles.kpiSub360} style={{ color: '#2563EB', fontWeight: 600, marginTop: 4 }}>
                      View Completed List →
                    </div>
                  </div>
                </div>

                {/* Published Services Section */}
                <div>
                  <div className={styles.sectionTitle360}>
                    <span>Live Services Catalog (Vendor Mobile App)</span>
                    <span className={styles.badge} style={{ background: '#F1F5F9', color: '#475569' }}>
                      {vendor360Data.services?.length || 0} Services Listed
                    </span>
                  </div>

                  {vendor360Data.services?.length === 0 ? (
                    <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: 10, textAlign: 'center', color: '#64748B', fontSize: 13.5, marginBottom: 20 }}>
                      This vendor has not published any custom services in their mobile app yet.
                    </div>
                  ) : (
                    <div className={styles.serviceListContainer}>
                      {vendor360Data.services.map((svc: any) => (
                        <div key={svc.id} className={styles.serviceCard360}>
                          <div className={styles.serviceCardInfo}>
                            <div className={styles.serviceTitle360}>
                              {svc.nameEn}
                              {svc.nameMr && <span style={{ color: '#64748B', fontWeight: 500, marginLeft: 8 }}>({svc.nameMr})</span>}
                            </div>
                            <div className={styles.serviceMeta360}>
                              <span>⏱ {svc.durationMins || 30} mins</span>
                              <span>•</span>
                              <span style={{ color: svc.isActive ? '#15803D' : '#94A3B8', fontWeight: 600 }}>
                                {svc.isActive ? 'Active in App' : 'Disabled'}
                              </span>
                              {svc.descriptionEn && (
                                <>
                                  <span>•</span>
                                  <span style={{ fontStyle: 'italic', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {svc.descriptionEn}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Cross-Link & Controls */}
                <div className={styles.drawerFooterActions}>
                  <button
                    className={styles.btnJumpBookings}
                    onClick={() => {
                      const shopSearch = vendor360Data.vendor.business?.nameEn || vendor360Data.vendor.user?.name || '';
                      setBookingSearch(shopSearch);
                      setActiveTab('bookings');
                      setSelectedVendorFor360(null);
                    }}
                  >
                    <CalendarCheck size={18} />
                    View All Orders in Bookings Tab →
                  </button>
                  <button
                    className={`${styles.btnToggleStatus} ${vendor360Data.vendor.user?.isActive ? styles.suspended : styles.active}`}
                    style={{ padding: '12px 16px', fontSize: 13.5 }}
                    onClick={async () => {
                      await handleToggleUserStatus(vendor360Data.vendor.userId, vendor360Data.vendor.user?.isActive);
                      setSelectedVendorFor360(null);
                    }}
                  >
                    {vendor360Data.vendor.user?.isActive ? 'Suspend Vendor' : 'Activate Vendor'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#EF4444' }}>
                Failed to load vendor 360 profile.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
