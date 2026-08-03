import json
import re
from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path("/Users/eduardo/DALO/dalo-platform")
INPUT = ROOT / "tmp/pdfs/inactive-products.json"
OUTPUT = ROOT / "output/pdf/dalo-inactive-products-audit-2026-08-03.pdf"

BLUE = colors.HexColor("#123A8C")
ROYAL = colors.HexColor("#2148C0")
INK = colors.HexColor("#13213A")
SLATE = colors.HexColor("#52627A")
LINE = colors.HexColor("#D8E1EF")
PALE = colors.HexColor("#F4F7FC")
RED = colors.HexColor("#B42318")
RED_PALE = colors.HexColor("#FFF1F0")
AMBER = colors.HexColor("#9A5B00")
AMBER_PALE = colors.HexColor("#FFF7E8")


def amount(value):
    match = re.search(r"\$(-?[0-9]+(?:\.[0-9]+)?)", value or "")
    return float(match.group(1)) if match else 0.0


def destination(product_name):
    return (product_name or "Unknown").split(" eSIM ", 1)[0].strip()


def parse_row(cells):
    buy = amount(cells[7])
    sell = amount(cells[8])
    profit = amount(cells[9])

    return {
        "destination": destination(cells[2]),
        "region": cells[1],
        "product": cells[2],
        "data": cells[3],
        "validity": cells[4],
        "plan": cells[5],
        "role": cells[6],
        "buy": buy,
        "sell": sell,
        "profit": profit,
        "margin": round((profit / sell) * 100) if sell else 0,
        "usage": cells[10],
        "provider_id": cells[11],
    }


rows = [parse_row(row) for row in json.loads(INPUT.read_text())]
negative = [row for row in rows if row["profit"] < 0]
large = [
    row
    for row in rows
    if row["profit"] >= 0 and row["data"].upper() in {"50GB", "100GB"}
]
other = [row for row in rows if row not in negative and row not in large]

OUTPUT.parent.mkdir(parents=True, exist_ok=True)

styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="ReportTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=25,
        leading=29,
        textColor=INK,
        alignment=TA_LEFT,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="ReportLead",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=SLATE,
        spaceAfter=12,
    )
)
styles.add(
    ParagraphStyle(
        name="SectionTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=INK,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        name="SectionNote",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=SLATE,
        spaceAfter=10,
    )
)
styles.add(
    ParagraphStyle(
        name="Cell",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=6.2,
        leading=7.5,
        textColor=INK,
    )
)
styles.add(
    ParagraphStyle(
        name="CellSmall",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=5.5,
        leading=6.6,
        textColor=INK,
    )
)
styles.add(
    ParagraphStyle(
        name="CellRight",
        parent=styles["Cell"],
        alignment=TA_RIGHT,
    )
)


def page_header_footer(canvas, doc):
    canvas.saveState()
    width, height = landscape(A4)
    canvas.setFillColor(BLUE)
    canvas.rect(0, height - 12 * mm, width, 12 * mm, stroke=0, fill=1)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.drawString(15 * mm, height - 8 * mm, "DALO")
    canvas.setFont("Helvetica", 7.5)
    canvas.drawRightString(
        width - 15 * mm, height - 8 * mm, "Inactive Product Audit | Internal"
    )
    canvas.setStrokeColor(LINE)
    canvas.line(15 * mm, 11 * mm, width - 15 * mm, 11 * mm)
    canvas.setFillColor(SLATE)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(15 * mm, 6.5 * mm, "Generated 03 Aug 2026 | Production catalog snapshot")
    canvas.drawRightString(width - 15 * mm, 6.5 * mm, f"Page {doc.page}")
    canvas.restoreState()


def stat_card(label, value, note, color):
    data = [
        [Paragraph(f"<b>{value}</b>", ParagraphStyle("v", fontName="Helvetica-Bold", fontSize=20, leading=22, textColor=color))],
        [Paragraph(label, ParagraphStyle("l", fontName="Helvetica-Bold", fontSize=8.5, leading=10, textColor=INK))],
        [Paragraph(note, ParagraphStyle("n", fontName="Helvetica", fontSize=7, leading=9, textColor=SLATE))],
    ]
    table = Table(data, colWidths=[76 * mm], rowHeights=[10 * mm, 6 * mm, 10 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 6 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
                ("TOPPADDING", (0, 0), (-1, 0), 4 * mm),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    return table


def product_table(items, negative_section=False):
    header = ["Destination", "Product", "Data", "Days", "Buy", "Sell", "Profit", "Margin", "Provider ID"]
    body = [header]
    for row in items:
        body.append(
            [
                Paragraph(row["destination"], styles["Cell"]),
                Paragraph(row["product"], styles["CellSmall"]),
                Paragraph(row["data"], styles["Cell"]),
                Paragraph(row["validity"].replace(" Days", ""), styles["CellRight"]),
                Paragraph(f"${row['buy']:.2f}", styles["CellRight"]),
                Paragraph(f"${row['sell']:.2f}", styles["CellRight"]),
                Paragraph(f"${row['profit']:.2f}", styles["CellRight"]),
                Paragraph(f"{row['margin']}%", styles["CellRight"]),
                Paragraph(row["provider_id"], styles["CellSmall"]),
            ]
        )
    widths = [27 * mm, 50 * mm, 13 * mm, 12 * mm, 15 * mm, 15 * mm, 16 * mm, 14 * mm, 85 * mm]
    table = Table(body, colWidths=widths, repeatRows=1, hAlign="LEFT")
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 6.5),
        ("LEADING", (0, 0), (-1, 0), 8),
        ("ALIGN", (3, 1), (7, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
        ("LEFTPADDING", (0, 0), (-1, -1), 2.2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2.2),
        ("TOPPADDING", (0, 1), (-1, -1), 2.7),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 2.7),
    ]
    if negative_section:
        commands.extend(
            [
                ("TEXTCOLOR", (6, 1), (7, -1), RED),
                ("FONTNAME", (6, 1), (7, -1), "Helvetica-Bold"),
            ]
        )
    table.setStyle(TableStyle(commands))
    return table


doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=landscape(A4),
    rightMargin=15 * mm,
    leftMargin=15 * mm,
    topMargin=19 * mm,
    bottomMargin=15 * mm,
    title="DALO Inactive Product Audit",
    author="DALO",
)

story = [
    Spacer(1, 4 * mm),
    Paragraph("Inactive product audit", styles["ReportTitle"]),
    Paragraph(
        "Complete production-catalog snapshot of all paused DALO eSIM products. "
        "This report separates loss-making tariffs from intentionally paused large-data plans "
        "and products requiring a commercial review.",
        styles["ReportLead"],
    ),
    Table(
        [[
            stat_card("PAUSED PRODUCTS", len(rows), "Not visible in quiz or recommendations", BLUE),
            stat_card("NEGATIVE PROFIT", len(negative), "Do not activate before repricing", RED),
            stat_card("LARGE DATA", len(large), "50/100GB with non-negative profit", AMBER),
        ]],
        colWidths=[83 * mm, 83 * mm, 83 * mm],
        style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 7)]),
    ),
    Spacer(1, 8 * mm),
    Paragraph("Management recommendation", styles["SectionTitle"]),
    Paragraph(
        f"Keep all {len(negative)} loss-making tariffs paused until selling prices are recalculated. "
        f"Review the {len(large)} profitable 50/100GB plans only for destinations where premium demand is realistic. "
        f"Manually review the remaining {len(other)} products for provider availability, regional overlap, market relevance and price competitiveness. "
        "No paused product should be bulk-activated without a provider and margin check.",
        styles["ReportLead"],
    ),
    Paragraph("Classification rules", styles["SectionTitle"]),
    Paragraph(
        "Negative profit: selling price is below purchase price. Large data: 50GB or 100GB and non-negative profit. "
        "Other paused: every remaining inactive product. Counts are mutually exclusive and total 317.",
        styles["SectionNote"],
    ),
    PageBreak(),
    Paragraph(f"1. Negative-profit tariffs ({len(negative)})", styles["SectionTitle"]),
    Paragraph("Commercial risk: every sale would create a gross loss before payment, support and operating costs.", styles["SectionNote"]),
    product_table(negative, negative_section=True),
    PageBreak(),
    Paragraph(f"2. Large-data tariffs ({len(large)})", styles["SectionTitle"]),
    Paragraph("Paused 50GB and 100GB products with non-negative gross profit. Review demand and absolute retail price before activation.", styles["SectionNote"]),
    product_table(large),
    PageBreak(),
    Paragraph(f"3. Other paused tariffs ({len(other)})", styles["SectionTitle"]),
    Paragraph("These products require an individual provider, coverage, duplication, pricing and market-relevance review.", styles["SectionNote"]),
    product_table(other),
]

doc.build(story, onFirstPage=page_header_footer, onLaterPages=page_header_footer)
print(OUTPUT)
