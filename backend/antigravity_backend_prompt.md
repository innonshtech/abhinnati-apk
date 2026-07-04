# Antigravity Task Prompt: Build Next.js Backend for Abhinnati

You are tasked with building the Next.js App Router backend for **Abhinnati** hyperlocal community & marketplace platform inside the `backend/` directory.

The database schema and `.env` template are already defined inside the `backend/` directory. You will install Next.js, configure Prisma Client, and implement all API endpoints.

---

## 1. Stack Setup & Dependencies

Initialize a Next.js App Router project in the `backend/` directory with TypeScript.
Install the following core dependencies:
- **Prisma & Client**: `@prisma/client`, `prisma` (devDependencies)
- **Validation**: `zod`
- **Authentication**: `jsonwebtoken` and `@types/jsonwebtoken` (or `jose` for edge compatibility)
- **CORS/Helpers**: `cors` (if custom server, though Next.js api routes handle CORS natively or via standard middleware headers)

### Configuration Files:
- Create `backend/lib/prisma.ts` containing the global Prisma Client singleton:
  ```typescript
  import { PrismaClient } from '@prisma/client';

  const globalForPrisma = global as unknown as { prisma: PrismaClient };

  export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['query'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  ```
- Create `backend/lib/auth.ts` for signing and verifying JWT tokens:
  - Extract the token from the `Authorization: Bearer <token>` header.
  - Expose a `verifyAuth(req: Request)` helper that returns the authenticated `User` object (with role and ID) or throws a 401 error.

---

## 2. Implement Database Seeding (`prisma/seed.ts`)

Create a script `backend/prisma/seed.ts` that will seed the PostgreSQL database with the exact mock data structures located in [mockData.ts](file:///d:/Abhinnati/src/api/mockData.ts).

Follow this creation order to respect database relationships:
1. **Areas**: Seed all operational circles (e.g. Bandra West, Kothrud, Deccan Gymkhana, Dadar, etc.) with coordinates and names.
2. **Categories**: Seed categories (Plumbing & Masonry, Legal Advice, Home Cleaning, Electrical Works, Home Cooked Tiffin).
3. **Users & Vendors**:
   - Create owner users for mock vendors.
   - Create the corresponding `Vendor` profiles with details from `mockVendors`.
4. **Services**: Create services linked to each vendor.
5. **Reviews**: Create reviews linked to each vendor and dummy reviewer users.
6. **Posts**: Create feed posts linked to user authors and respective areas.
7. **Comments**: Create comments linked to posts.
8. **Bookings & Notifications**: Prepopulate a few sample active and completed bookings.

Register the seed command in `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

---

## 3. API Endpoints Implementation

Implement the Next.js Route Handlers (`route.ts`) under `backend/app/api/v1/`. Ensure they return exactly the JSON keys and types expected by [client.ts](file:///d:/Abhinnati/src/api/client.ts).

### 3.1 Authentication Handlers
* **`POST /api/v1/auth/request-otp`**
  - **Payload**: `{ phone_number: string }`
  - **Action**: Check if there's a valid unexpired OTP session. For now (mock mode), generate a random 6-digit OTP (default to `123456`), log it to the console, create a temporary OTP log in the DB (or memory store with expiry), and return `{ success: true, sessionId: "string" }`.
* **`POST /api/v1/auth/verify-otp`**
  - **Payload**: `{ session_id: string, code: string }`
  - **Action**: Validate code. If correct:
    - Query user by phone. If they do not exist, create a new `User` with role `resident`.
    - Sign a JWT containing the user `id`, `phone`, and `role`.
    - Return `{ success: true, token, isNewUser: boolean, role: 'resident' | 'vendor' }`.

### 3.2 Hyperlocal Area Handlers
* **`GET /api/v1/areas`**
  - **Action**: Return all rows from the `Area` table.

### 3.3 Marketplace Handlers
* **`GET /api/v1/marketplace/explore`**
  - **Action**: Return all rows from the `Category` table.
* **`GET /api/v1/marketplace/vendors`**
  - **Query parameters**: `area_id` (required), `category` (optional slug).
  - **Action**: Fetch all vendors active in that `area_id` where `kycStatus = 'approved'`. If a category slug is provided, filter vendors by `categorySlug`. Include `services` and `reviews` relationships in the response.
* **`GET /api/v1/marketplace/vendors/:id`**
  - **Action**: Return vendor by ID with nested `services` and `reviews`.

### 3.4 Vendor Mode Handlers (Requires Auth Token)
* **`GET /api/v1/vendor/profile`**
  - **Action**: Verify JWT, return the `Vendor` profile belonging to the logged-in user. Include services list.
* **`POST /api/v1/vendor/kyc`**
  - **Payload**: `{ businessNameMr, businessNameEn, categorySlug, categoryNameMr, categoryNameEn, descriptionMr, descriptionEn, latitude, longitude, areaId, kycDocsUrl }`
  - **Action**: Register the authenticated user as a vendor. Set `kycStatus` to `pending`. If successful, update the User's role to `vendor` and return the new vendor object.
* **`PATCH /api/v1/vendor/profile/vacation`**
  - **Payload**: `{ isFullyBooked: boolean }`
  - **Action**: Update `isFullyBooked` flag for the user's vendor profile.
* **`POST /api/v1/vendor/services`**
  - **Payload**: `{ id?: string, name_mr, name_en, price, duration_mins, description_mr, description_en }`
  - **Action**: If `id` is provided, update the existing service. Otherwise, insert a new `Service` record associated with the vendor.
* **`DELETE /api/v1/vendor/services/:serviceId`**
  - **Action**: Delete the specified service.
* **`POST /api/v1/vendor/reviews/:reviewId/reply`**
  - **Payload**: `{ reply: string }`
  - **Action**: Save the replies text on the review.

### 3.5 Community Feed Handlers
* **`GET /api/v1/community/feed`**
  - **Query parameters**: `area_id` (required)
  - **Action**: Get posts belonging to `area_id` sorted by `createdAt DESC`. Include author information and likes count.
* **`POST /api/v1/community/posts`**
  - **Payload**: `{ tag, title_mr, title_en, content_mr, content_en, imageUrl }` (Requires Auth)
  - **Action**: Create a new feed `Post`. Set authorName to current user's name, and areaId to the user's selected area.
* **`POST /api/v1/community/posts/:postId/like`** (Requires Auth)
  - **Action**: Toggle user like. Check if a `UserPostLike` record exists for the user-post pair. If yes, delete it and decrement `likes` count on `Post`. If not, create it and increment `likes` count.
* **`GET /api/v1/community/posts/:postId/comments`**
  - **Action**: List comments for the post.
* **`POST /api/v1/community/posts/:postId/comments`** (Requires Auth)
  - **Payload**: `{ authorName, content }`
  - **Action**: Create a new comment linked to the post. Increment the `commentsCount` of the post.

### 3.6 Booking Handlers (Requires Auth)
* **`GET /api/v1/bookings`**
  - **Query parameters**: `user_id` (optional), `vendor_id` (optional)
  - **Action**: Retrieve bookings. Ensure users only access their own bookings or vendors only access requests sent to them.
* **`POST /api/v1/bookings`**
  - **Payload**: `{ vendorId, vendorName, serviceId, serviceName, price, bookingDate, bookingTime, notes, paymentMethod }`
  - **Action**: Create booking. Set status/trackingStatus to `pending` and `ordered`. Auto-create a `NotificationItem` record for the vendor: `"New booking request received!"` in both English and Marathi.
* **`PATCH /api/v1/bookings/:bookingId`**
  - **Payload**: `{ status?: string, trackingStatus?: string }`
  - **Action**: Update status/tracking. If status is updated to `accepted`, send notification to the resident: `"Your booking has been accepted!"`. If completed, notify resident.
* **`POST /api/v1/bookings/:bookingId/review`**
  - **Payload**: `{ rating, text }`
  - **Action**: Add review. Calculate new average rating (`ratingAvg`) and review count (`reviewsCount`) for the vendor, save it on the `Vendor` table, and write the review record.

### 3.7 Notification Handlers (Requires Auth)
* **`GET /api/v1/notifications`**
  - **Action**: Fetch all unread notification items for the user, ordered by `createdAt DESC`.
* **`POST /api/v1/notifications/read`**
  - **Action**: Mark all notification items for the authenticated user as `read: true`.

---

## 4. Verification and Local Testing
- Generate Prisma Client: `npx prisma generate`
- Run database migrations: `npx prisma db push`
- Start the server: `npm run dev` (running on `http://localhost:3000`)
- Verify using Postman or a custom cURL test script verifying response JSON fields match client requirements.
