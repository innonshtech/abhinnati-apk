-- Row Level Security (RLS) Configuration Script for Abhinnati Supabase Schema

-- =====================================================================
-- 1. Enable RLS on all relational tables
-- =====================================================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vendor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationItem" ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 2. Define User Self-Access Policy
-- =====================================================================
CREATE POLICY user_self_read ON "User" FOR SELECT USING (
    auth.uid()::text = "id" OR auth.role() = 'service_role'
);
CREATE POLICY user_self_update ON "User" FOR UPDATE USING (
    auth.uid()::text = "id" OR auth.role() = 'service_role'
) WITH CHECK (
    auth.uid()::text = "id" OR auth.role() = 'service_role'
);

-- =====================================================================
-- 3. Define Vendor Access Policies
-- =====================================================================
CREATE POLICY vendor_read_approved ON "Vendor" FOR SELECT USING (
    "kycStatus" = 'approved' OR auth.uid()::text = "userId" OR auth.role() = 'service_role'
);
CREATE POLICY vendor_modify_owner ON "Vendor" FOR ALL USING (
    auth.uid()::text = "userId" OR auth.role() = 'service_role'
);

-- =====================================================================
-- 4. Define Service Access Policies
-- =====================================================================
CREATE POLICY service_read_all ON "Service" FOR SELECT USING (
    true
);
CREATE POLICY service_modify_owner ON "Service" FOR ALL USING (
    EXISTS (
        SELECT 1 FROM "Vendor"
        WHERE "Vendor"."id" = "Service"."vendorId"
          AND ("Vendor"."userId" = auth.uid()::text OR auth.role() = 'service_role')
    )
);

-- =====================================================================
-- 5. Define Review Access Policies
-- =====================================================================
CREATE POLICY review_read_all ON "Review" FOR SELECT USING (
    true
);
CREATE POLICY review_insert_authenticated ON "Review" FOR INSERT WITH CHECK (
    auth.uid()::text = "userId" OR auth.role() = 'service_role'
);
CREATE POLICY review_modify_owner ON "Review" FOR UPDATE USING (
    auth.uid()::text = "userId" OR auth.role() = 'service_role'
);

-- =====================================================================
-- 6. Define Booking Access Policies
-- =====================================================================
CREATE POLICY booking_access_owner ON "Booking" FOR ALL USING (
    auth.uid()::text = "userId" 
    OR EXISTS (
        SELECT 1 FROM "Vendor"
        WHERE "Vendor"."id" = "Booking"."vendorId"
          AND "Vendor"."userId" = auth.uid()::text
    )
    OR auth.role() = 'service_role'
);

-- =====================================================================
-- 7. Define Community Post Access Policies
-- =====================================================================
CREATE POLICY post_read_all ON "Post" FOR SELECT USING (
    true
);
CREATE POLICY post_modify_owner ON "Post" FOR ALL USING (
    auth.uid()::text = "authorId" OR auth.role() = 'service_role'
);

-- =====================================================================
-- 8. Define Comment Access Policies
-- =====================================================================
CREATE POLICY comment_read_all ON "Comment" FOR SELECT USING (
    true
);
CREATE POLICY comment_insert_authenticated ON "Comment" FOR INSERT WITH CHECK (
    auth.uid()::text = "authorId" OR auth.role() = 'service_role'
);
CREATE POLICY comment_modify_owner ON "Comment" FOR ALL USING (
    auth.uid()::text = "authorId" OR auth.role() = 'service_role'
);

-- =====================================================================
-- 9. Define Notification Access Policies
-- =====================================================================
CREATE POLICY notification_self ON "NotificationItem" FOR ALL USING (
    auth.uid()::text = "userId" OR auth.role() = 'service_role'
);
