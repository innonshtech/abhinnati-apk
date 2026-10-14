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
            self.drawString(54, 755, "Abhinnati — Vendor 360 Analytics vs. Bookings Architecture Plan")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 747, 558, 747)
        
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_text)
        self.drawString(54, 36, "CONFIDENTIAL — Abhinnati Operations & Architecture Desk")
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

    # Custom color palette
    primary_color = colors.HexColor("#1E3A8A")  # Deep Blue
    brand_blue = colors.HexColor("#2563EB")
    dark_neutral = colors.HexColor("#0F172A")
    muted_slate = colors.HexColor("#475569")
    card_bg = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#E2E8F0")
    success_color = colors.HexColor("#166534")
    warning_color = colors.HexColor("#92400E")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=muted_slate,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
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
        textColor=brand_blue,
        spaceBefore=8,
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

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=dark_neutral
    )

    table_cell_bold = ParagraphStyle(
        'TDBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=primary_color
    )

    story = []

    # Title & Header
    story.append(Paragraph("Abhinnati (अभिजन्मा उन्नती)", title_style))
    story.append(Paragraph("Architectural Decision & Technical Blueprint: Vendor 360 Profile vs. Bookings Overview", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=brand_blue, spaceBefore=0, spaceAfter=14))

    # SECTION 1: The Core Question & Confusion Addressed
    story.append(Paragraph("1. Architectural Clarification: Are You Mixing Them Up?", h1_style))
    story.append(Paragraph(
        "<b>Yes, but this is a very natural and common design challenge in multi-vendor platforms.</b> "
        "You are comparing two different perspectives of the exact same underlying business data:",
        body_style
    ))

    story.append(Paragraph(
        "• <b>The Operations Ledger (Bookings Overview):</b> Transaction-centric. It answers: <i>'What orders are occurring across Maharashtra today? Which are pending payment, en route, or scheduled?'</i> Its primary actor is the operations/dispatch team.",
        bullet_style
    ))
    story.append(Paragraph(
        "• <b>The Partner Health Dossier (Vendor 360 View):</b> Entity-centric. It answers: <i>'How good is this specific shop owner? What services do they sell, what percentage of incoming requests do they decline, and what is their customer rating?'</i> Its primary actor is the vendor account manager.",
        bullet_style
    ))
    story.append(Spacer(1, 8))

    # SECTION 2: Direct Comparison Matrix
    story.append(Paragraph("2. Deep Comparison: Option A vs. Option B", h1_style))

    comp_data = [
        [
            Paragraph("Evaluation Criteria", table_header_style),
            Paragraph("Option A: Vendor 360 Profile (Drawer in Users)", table_header_style),
            Paragraph("Option B: Vendor Filter inside Bookings Tab", table_header_style)
        ],
        [
            Paragraph("Core Concept", table_cell_bold),
            Paragraph("Clicking on a vendor opens their dedicated profile (Services catalog + Acceptance % + Decline % + Ratings).", table_cell_style),
            Paragraph("Adding a Vendor selector on top of the Bookings table to show that vendor's orders and active services.", table_cell_style)
        ],
        [
            Paragraph("User Experience", table_cell_bold),
            Paragraph("<b>Intuitive & Industry Standard</b> (Amazon Seller, Urban Company, Zomato). Full visibility into shop health in one view.", table_cell_style),
            Paragraph("<b>Confusing & Cluttered.</b> Bookings table is forced to show catalog services and transaction history simultaneously.", table_cell_style)
        ],
        [
            Paragraph("Performance Metrics", table_cell_bold),
            Paragraph("Clearly calculates: Acceptance Rate (%), Decline Rate (%), Completed Jobs, Total GMV Revenue (₹), Customer Reviews.", table_cell_style),
            Paragraph("Only displays row counts for bookings. Cannot cleanly show service durations, pricing tiers, or photos.", table_cell_style)
        ],
        [
            Paragraph("Mobile App Connection", table_cell_bold),
            Paragraph("Direct sync with Vendor APK: Vendor adds a service or accepts/declines a job $\\rightarrow$ instantly updates in Admin.", table_cell_style),
            Paragraph("Disconnected: If a vendor adds a service that has 0 bookings yet, it remains invisible in this view.", table_cell_style)
        ],
        [
            Paragraph("Verdict & Rating", table_cell_bold),
            Paragraph("<b>BEST OPTION (Recommended 10/10)</b>", ParagraphStyle('Rec', parent=table_cell_bold, textColor=success_color)),
            Paragraph("Sub-optimal (4/10) — Mixes transactions with partner management.", ParagraphStyle('Sub', parent=table_cell_style, textColor=warning_color))
        ]
    ]

    t_comp = Table(comp_data, colWidths=[110, 200, 194])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 14))

    # SECTION 3: The Golden Architecture
    story.append(Paragraph("3. The Gold Standard Architecture: Option A + Deep Cross-Link", h1_style))
    story.append(Paragraph(
        "To give you the most powerful enterprise dashboard without mixing up features, we recommend the <b>Unified Two-Way Architecture</b>:",
        body_style
    ))
    story.append(Paragraph(
        "1. <b>Keep Bookings Overview Clean:</b> It remains the master ledger for all customer bookings across Maharashtra with search and status pills.",
        bullet_style
    ))
    story.append(Paragraph(
        "2. <b>Implement Vendor 360 Drawer in User Management:</b> In the 'User Management' $\\rightarrow$ 'Vendor' tab (as seen in your screenshot), clicking on <b>Aai's Bakery Owner</b> slides out a rich inspection drawer with:",
        bullet_style
    ))
    story.append(Paragraph(
        "    • <b>Partner Dossier:</b> Shop Name, Contact, Owner Name, KYC Verification badge, Service Radius.",
        bullet_style
    ))
    story.append(Paragraph(
        "    • <b>Catalog / Services List:</b> All active services registered by this shop in the Vendor APK (e.g. 'Cake Baking', 'Birthday Catering', 'Special Delivery') with duration and ₹ price.",
        bullet_style
    ))
    story.append(Paragraph(
        "    • <b>Fulfillment Analytics:</b> Total Requests Received, Acceptance Rate (e.g. 92%), Decline Rate (8%), Completed Orders, and Total GMV (₹ earned).",
        bullet_style
    ))
    story.append(Paragraph(
        "3. <b>Seamless Cross-Link:</b> Inside the Vendor 360 Drawer, a single button: <i>'View All Orders in Bookings Tab $\\rightarrow$'</i> instantly redirects the admin to Bookings Overview filtered to that exact shop!",
        bullet_style
    ))

    story.append(PageBreak())

    # SECTION 4: Data Flow from Mobile Apps to Admin
    story.append(Paragraph("4. End-to-End Realtime Sync Architecture", h1_style))
    story.append(Paragraph(
        "Here is how the Vendor Mobile App, Resident Mobile App, and Admin Dashboard stay synchronized:",
        body_style
    ))

    flow_data = [
        [
            Paragraph("Component", table_header_style),
            Paragraph("Action & Event", table_header_style),
            Paragraph("Database & Real-time Impact in Admin", table_header_style)
        ],
        [
            Paragraph("Resident APK", table_cell_bold),
            Paragraph("Customer books a service with date and time slot.", table_cell_style),
            Paragraph("Creates <code>Booking</code> record with <code>status: 'pending'</code>. Increments Vendor's Total Requests counter in Admin.", table_cell_style)
        ],
        [
            Paragraph("Vendor APK", table_cell_bold),
            Paragraph("Vendor accepts the incoming order from notification.", table_cell_style),
            Paragraph("Updates <code>Booking.status = 'accepted'</code>. Vendor's Acceptance Rate in Admin automatically rises.", table_cell_style)
        ],
        [
            Paragraph("Vendor APK", table_cell_bold),
            Paragraph("Vendor declines order due to schedule conflict.", table_cell_style),
            Paragraph("Updates <code>Booking.status = 'declined'</code>. Admin Vendor 360 immediately registers the decline in performance analytics.", table_cell_style)
        ],
        [
            Paragraph("Vendor APK", table_cell_bold),
            Paragraph("Vendor adds a new service in their catalog screen.", table_cell_style),
            Paragraph("Creates <code>VendorService</code> under vendor's <code>businessId</code>. Instantly visible in Admin's Vendor Services list.", table_cell_style)
        ]
    ]

    t_flow = Table(flow_data, colWidths=[90, 204, 210])
    t_flow.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_flow)
    story.append(Spacer(1, 14))

    # SECTION 5: Implementation Blueprint
    story.append(Paragraph("5. Technical Implementation Steps", h1_style))

    story.append(Paragraph("Step 1: Backend API — <code>GET /api/v1/admin/vendors/[id]/profile</code>", h2_style))
    story.append(Paragraph(
        "Create an endpoint that fetches the vendor profile along with their registered services (<code>prisma.vendorService.findMany</code>) "
        "and aggregates booking counts: <code>accepted</code>, <code>completed</code>, <code>declined</code>, <code>cancelled</code>, and sum of earnings.",
        body_style
    ))

    story.append(Paragraph("Step 2: Frontend — Vendor 360 Slide-Over Drawer", h2_style))
    story.append(Paragraph(
        "In <code>AdminDashboardClient.tsx</code>, make vendor rows in User Management clickable. "
        "Clicking opens a sleek modal/drawer featuring three key cards: "
        "<b>1. Business Overview</b>, <b>2. Live Services Offered (with prices & durations)</b>, and <b>3. Performance Ratio Cards (Acceptance % vs Decline %)</b>.",
        body_style
    ))

    story.append(Paragraph("Step 3: Two-Way Navigation Bridge", h2_style))
    story.append(Paragraph(
        "Inside the drawer, add a link <i>'View Orders in Bookings Tab'</i> which sets <code>activeTab = 'bookings'</code> "
        "and sets <code>bookingSearch = vendor.business.nameEn</code> so the admin can seamlessly audit that vendor's exact orders.",
        body_style
    ))

    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceBefore=8, spaceAfter=12))

    story.append(Paragraph(
        "<b>Conclusion:</b> Do not mix vendor catalog management inside the Bookings Overview tab. "
        "Keep Bookings Overview dedicated to live operations, and implement Option A (Vendor 360 Detail View) "
        "in User Management with a direct cross-link. This is the cleanest, most scalable architecture.",
        ParagraphStyle('Conclusion', parent=body_style, fontName='Helvetica-Bold', textColor=primary_color)
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully created: {filename}")

if __name__ == "__main__":
    out_pdf = r"c:\Users\pc\Desktop\Abbhinaty AD\abhinnati-apk\ABHINNATI_VENDOR_ANALYTICS_PLAN.pdf"
    create_pdf(out_pdf)
