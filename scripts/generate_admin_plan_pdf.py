import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "Abhinnati (Abhijat Unnati) — Admin Dashboard Architecture Plan")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 747, 558, 747)
        
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_text)
        self.drawString(54, 36, "CONFIDENTIAL — Abhinnati Operations & Engineering Desk")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        
        self.restoreState()

def create_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#1E3A8A")  # Navy / Deep Blue
    brand_blue = colors.HexColor("#2563EB")
    dark_neutral = colors.HexColor("#0F172A")
    muted_slate = colors.HexColor("#475569")
    card_bg = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#E2E8F0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=muted_slate,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=dark_neutral,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=dark_neutral,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=dark_neutral
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("Abhinnati — Admin Dashboard Architecture Plan", title_style))
    story.append(Paragraph("System Architecture, Security Specification & Implementation Roadmap", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=brand_blue, spaceAfter=12))

    # Meta Info Card Table
    meta_data = [
        [
            Paragraph("<b>Target Platform:</b> Next.js 16 (App Router), Prisma 6, Supabase PostgreSQL", table_cell_style),
            Paragraph("<b>Date:</b> October 2026", table_cell_style)
        ],
        [
            Paragraph("<b>Scope:</b> Internal Operations Desk (Vendor KYC, Users, Categories, Feed)", table_cell_style),
            Paragraph("<b>Status:</b> Ready for Implementation", table_cell_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[340, 164])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary & Current State Analysis", h1_style))
    story.append(Paragraph(
        "<b>Current State:</b> The backend is running on <code>localhost:3000</code> and is <b>100% connected</b> to the live Supabase PostgreSQL database via Prisma ORM. Live counters on the KYC screen (e.g., <i>Approved Vendors: 1</i>, <i>Total: 1</i>) are directly fetched from Supabase.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Why other sidebar buttons cannot be clicked:</b> The initial developer wrote the complete database query for the <i>KYC Approvals</i> view, but only created static HTML placeholder elements for the remaining 4 sidebar buttons (<i>User Management, Content Moderation, Analytics, Settings</i>). There are no click handlers, tab states, or subpages attached to them.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Security Vulnerability:</b> The admin dashboard currently lacks an authentication gate. Any visitor navigating to <code>/admin</code> can view the interface. An admin login system must be implemented immediately.",
        body_style
    ))

    # Current vs Target State Table
    state_data = [
        [Paragraph("Feature / View", table_header_style), Paragraph("Current State", table_header_style), Paragraph("Target Architecture State", table_header_style)],
        [
            Paragraph("<b>Admin Authentication</b>", table_cell_style),
            Paragraph("❌ None (Publicly exposed)", table_cell_style),
            Paragraph("Secure Login Gate (/admin/login) with bcrypt, JWT, and httpOnly cookie session guard.", table_cell_style)
        ],
        [
            Paragraph("<b>KYC Approvals Desk</b>", table_cell_style),
            Paragraph("🟡 Partial (List & Approve only)", table_cell_style),
            Paragraph("Aadhaar/License inspection modal, verified badges, and 'Reject with mandatory reason' flow.", table_cell_style)
        ],
        [
            Paragraph("<b>User Management</b>", table_cell_style),
            Paragraph("❌ Unclickable placeholder", table_cell_style),
            Paragraph("Live searchable table of all residents, vendors, and admins with status toggle (Active/Suspended).", table_cell_style)
        ],
        [
            Paragraph("<b>Category Management</b>", table_cell_style),
            Paragraph("❌ Missing from dashboard", table_cell_style),
            Paragraph("Bilingual taxonomy desk (Marathi & English names, icon mapping, active switch, order).", table_cell_style)
        ],
        [
            Paragraph("<b>Content Moderation</b>", table_cell_style),
            Paragraph("❌ Unclickable placeholder", table_cell_style),
            Paragraph("Local feed inspector: filter community posts by area, remove spam or inappropriate issues.", table_cell_style)
        ]
    ]
    t_state = Table(state_data, colWidths=[130, 130, 244])
    t_state.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_state)
    story.append(Spacer(1, 10))

    # Page Break for clean sectioning
    story.append(PageBreak())

    # 2. System Architecture & Security Specification
    story.append(Paragraph("2. System Architecture & Security Specification", h1_style))
    story.append(Paragraph(
        "The admin desk is an internal web operations interface designed exclusively for the Abhinnati staff. As detailed in the Knowledge Transfer documentation, it operates as an internal review console, entirely separate from the resident mobile app.",
        body_style
    ))

    story.append(Paragraph("A. Admin Authentication & Session Security", h2_style))
    story.append(Paragraph(
        "<b>1. Default Seeded Credentials:</b><br/>"
        "• Phone: <code>9999999999</code><br/>"
        "• Email: <code>admin@abhinnati.com</code><br/>"
        "• Password: <code>Admin@123</code> (Stored as a one-way bcrypt salted hash in Supabase)<br/>"
        "• System Role: <code>admin</code>",
        body_style
    ))
    story.append(Paragraph(
        "<b>2. Login Workflow (/admin/login):</b><br/>"
        "• Admin inputs phone or email and password.<br/>"
        "• Request is processed by <code>POST /api/v1/admin/auth/login</code>.<br/>"
        "• The system validates the bcrypt hash and explicitly checks: <code>user.role === 'admin'</code>. Non-admin users are rejected with <code>403 Forbidden</code>.<br/>"
        "• Upon success, the server issues a signed JWT containing <code>{ userId, role, phone }</code> inside an <b>httpOnly, SameSite=Lax, Secure cookie</b> named <code>abhinnati_admin_session</code>.<br/>"
        "• The cookie cannot be stolen via JavaScript XSS attacks.",
        body_style
    ))
    story.append(Paragraph(
        "<b>3. Route Guard & Middleware Protection:</b><br/>"
        "• Next.js layout guard inspects every inbound request to <code>/admin/*</code>.<br/>"
        "• If the cookie is absent or invalid, the user is redirected to <code>/admin/login</code>.<br/>"
        "• The navigation bar includes the logged-in admin's profile and a 1-click <b>Logout</b> button that destroys the cookie session.",
        body_style
    ))

    story.append(Spacer(1, 6))
    story.append(Paragraph("B. Database & Prisma Data Flow", h2_style))
    story.append(Paragraph(
        "All data actions flow directly through Prisma Client into Supabase:",
        body_style
    ))

    arch_flow = [
        [Paragraph("Layer", table_header_style), Paragraph("Component", table_header_style), Paragraph("Responsibility", table_header_style)],
        [
            Paragraph("Presentation", table_cell_style),
            Paragraph("Next.js App Router (React)", table_cell_style),
            Paragraph("Admin client dashboard, interactive tabs, modals, tables, and login screen.", table_cell_style)
        ],
        [
            Paragraph("API / Server", table_cell_style),
            Paragraph("Route Handlers (/api/v1/admin/*)", table_cell_style),
            Paragraph("Validates admin JWT session, processes approvals, updates users, handles categories.", table_cell_style)
        ],
        [
            Paragraph("ORM Layer", table_cell_style),
            Paragraph("Prisma Client (v6.19.3)", table_cell_style),
            Paragraph("Type-safe database abstraction using transaction and session poolers.", table_cell_style)
        ],
        [
            Paragraph("Persistence", table_cell_style),
            Paragraph("Supabase PostgreSQL", table_cell_style),
            Paragraph("Stores User, Vendor, Business, Category, Booking, Notification, and Audit tables.", table_cell_style)
        ]
    ]
    t_arch = Table(arch_flow, colWidths=[90, 160, 254])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 10))

    # Page Break
    story.append(PageBreak())

    # 3. Detailed Specifications for the 5 Modules
    story.append(Paragraph("3. Detailed Module Specifications (Aligned with Knowledge Transfer)", h1_style))

    # Module 1
    story.append(Paragraph("Module 1: Vendor KYC Verification Desk (Pages 5 & 9)", h2_style))
    story.append(Paragraph(
        "<b>Requirement:</b> When a resident registers a business on the mobile app, they submit identity proof (mandatory Aadhaar card, optional FSSAI licence for food businesses, GST, shop licence). The profile remains <i>'Under review'</i> until approved by Admin.<br/>"
        "<b>Admin Actions:</b><br/>"
        "• <b>Inspection Modal:</b> Clicking any pending vendor opens their profile showing business name (Marathi + English), category, phone, operating radius, and clickable document links (Aadhaar, FSSAI).<br/>"
        "• <b>Approve:</b> Updates <code>kycStatus = 'approved'</code>. Unlocks Vendor Mode on the mobile phone and sends an approval notification.<br/>"
        "• <b>Reject with Reason:</b> Prompts the admin to enter a rejection explanation (e.g. <i>'Aadhaar image is unclear, please upload a sharper photo'</i>). Updates status to <code>'rejected'</code> and records the reason so the vendor can see it and resubmit.",
        body_style
    ))

    # Module 2
    story.append(Paragraph("Module 2: User & Vendor Management Desk", h2_style))
    story.append(Paragraph(
        "<b>Requirement:</b> The admin team needs complete oversight of all residents, vendors, and platform users.<br/>"
        "<b>Admin Capabilities:</b><br/>"
        "• Search users by phone number or name.<br/>"
        "• Filter list by role (<code>All</code>, <code>Residents</code>, <code>Vendors</code>, <code>Admins</code>).<br/>"
        "• Inspect registration date, language preference (Marathi / English), and total orders/bookings.<br/>"
        "• Suspend or deactivate rogue or fraudulent accounts.",
        body_style
    ))

    # Module 3
    story.append(Paragraph("Module 3: Bilingual Category Governance (Pages 3 & 9)", h2_style))
    story.append(Paragraph(
        "<b>Requirement:</b> The Explore screen in the mobile app displays local service categories (Bakery, Cleaning, Plumbing, Electrical, Tiffin, Legal). Admin must govern these taxonomies.<br/>"
        "<b>Admin Capabilities:</b><br/>"
        "• View all categories stored in the <code>Category</code> table.<br/>"
        "• Edit Marathi names (e.g. Marathi translations of Bakery, Sweets) and English names.<br/>"
        "• Assign Lucide icon identifiers (e.g. <code>Utensils</code>, <code>Scissors</code>, <code>Wrench</code>).<br/>"
        "• Toggle category visibility (<code>Active</code> / <code>Inactive</code>) without deleting historical data.<br/>"
        "• Adjust display order to highlight seasonal or popular services.",
        body_style
    ))

    # Module 4
    story.append(Paragraph("Module 4: Community Content Moderation Desk (Page 5)", h2_style))
    story.append(Paragraph(
        "<b>Requirement:</b> Abhinnati provides a neighbourhood feed for local issues and community questions. The operations desk must maintain safety and trust.<br/>"
        "<b>Admin Capabilities:</b><br/>"
        "• Filter community feed posts by neighbourhood circle (Bandra West, Kothrud, etc.).<br/>"
        "• View flagged or reported issues.<br/>"
        "• 1-Click delete/remove inappropriate posts or comments from the live feed.",
        body_style
    ))

    # Module 5
    story.append(Paragraph("Module 5: System Analytics & Overview", h2_style))
    story.append(Paragraph(
        "<b>Metrics Tracked:</b> Total Users, Approved Vendors, Pending Reviews, Total Completed Bookings, and distribution across operational circles (Mumbai, Pune, Nashik).",
        body_style
    ))

    story.append(Spacer(1, 10))

    # 4. Implementation Roadmap
    story.append(Paragraph("4. Step-by-Step Implementation Roadmap", h1_style))

    roadmap_data = [
        [Paragraph("Phase", table_header_style), Paragraph("Deliverables", table_header_style), Paragraph("Outcome", table_header_style)],
        [
            Paragraph("<b>Phase 1:<br/>Authentication & Security Gate</b>", table_cell_style),
            Paragraph("1. Create <code>/admin/login</code> page.<br/>2. Implement <code>POST /api/v1/admin/auth/login</code>.<br/>3. Protect <code>/admin/*</code> routes with httpOnly cookie guard.<br/>4. Add Logout button to dashboard header.", table_cell_style),
            Paragraph("The admin portal is locked down. Only authorized staff with password can access the panel.", table_cell_style)
        ],
        [
            Paragraph("<b>Phase 2:<br/>Interactive Tabs & KYC Workflow</b>", table_cell_style),
            Paragraph("1. Update <code>AdminDashboardClient.tsx</code> with dynamic <code>activeTab</code> state.<br/>2. Make all sidebar buttons clickable.<br/>3. Build KYC document inspection modal.<br/>4. Build 'Reject with Reason' API and UI dialog.", table_cell_style),
            Paragraph("Full vendor lifecycle management: Admin can view documents and approve or reject with feedback.", table_cell_style)
        ],
        [
            Paragraph("<b>Phase 3:<br/>Live User Management Desk</b>", table_cell_style),
            Paragraph("1. Connect <code>User Management</code> tab to Supabase <code>prisma.user</code> query.<br/>2. Add real-time search and role filter pills.<br/>3. Account status toggle (Active/Suspended).", table_cell_style),
            Paragraph("Complete visibility into residents, vendors, and their account histories.", table_cell_style)
        ],
        [
            Paragraph("<b>Phase 4:<br/>Category & Content Desks</b>", table_cell_style),
            Paragraph("1. Build Category Manager view (Bilingual edit & active toggle).<br/>2. Build Community Feed Moderation view (inspect and purge flagged posts).", table_cell_style),
            Paragraph("100% feature-complete admin portal matching the Abhinnati Knowledge Transfer PDF.", table_cell_style)
        ]
    ]

    t_roadmap = Table(roadmap_data, colWidths=[100, 244, 160])
    t_roadmap.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_roadmap)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")

if __name__ == '__main__':
    output_path = r"c:\Users\pc\Desktop\Abbhinaty AD\abhinnati-apk\ABHINNATI_ADMIN_ARCHITECTURE_PLAN.pdf"
    create_pdf(output_path)
