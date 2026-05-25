from __future__ import annotations

from pathlib import Path
from textwrap import dedent
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUT = Path(__file__).with_name("cobol_basics_colorful.pdf")

PAGE_W, PAGE_H = A4
MARGIN_X = 1.55 * cm
MARGIN_TOP = 1.75 * cm
MARGIN_BOTTOM = 1.45 * cm
CONTENT_W = PAGE_W - (MARGIN_X * 2)


PALETTE = {
    "ink": colors.HexColor("#182235"),
    "muted": colors.HexColor("#64748B"),
    "blue": colors.HexColor("#2563EB"),
    "teal": colors.HexColor("#0F766E"),
    "green": colors.HexColor("#16A34A"),
    "amber": colors.HexColor("#F59E0B"),
    "coral": colors.HexColor("#EF4444"),
    "indigo": colors.HexColor("#4F46E5"),
    "sky": colors.HexColor("#0284C7"),
    "paper": colors.HexColor("#F8FAFC"),
    "soft_blue": colors.HexColor("#DBEAFE"),
    "soft_teal": colors.HexColor("#CCFBF1"),
    "soft_amber": colors.HexColor("#FEF3C7"),
    "soft_coral": colors.HexColor("#FEE2E2"),
    "soft_green": colors.HexColor("#DCFCE7"),
    "soft_indigo": colors.HexColor("#E0E7FF"),
    "code_bg": colors.HexColor("#111827"),
    "code_fg": colors.HexColor("#E5E7EB"),
    "white": colors.white,
}


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=34,
        leading=39,
        alignment=TA_LEFT,
        textColor=PALETTE["white"],
        spaceAfter=12,
    )
)
styles.add(
    ParagraphStyle(
        "CoverSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#E0F2FE"),
        spaceAfter=16,
    )
)
styles.add(
    ParagraphStyle(
        "H1Custom",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=27,
        textColor=PALETTE["ink"],
        spaceBefore=6,
        spaceAfter=10,
    )
)
styles.add(
    ParagraphStyle(
        "H2Custom",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=PALETTE["ink"],
        spaceBefore=12,
        spaceAfter=7,
    )
)
styles.add(
    ParagraphStyle(
        "H3Custom",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=11.5,
        leading=14.5,
        textColor=PALETTE["ink"],
        spaceBefore=7,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        "BodyCustom",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.8,
        leading=14.3,
        textColor=PALETTE["ink"],
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        "Small",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.3,
        leading=11.6,
        textColor=PALETTE["muted"],
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        "BoxTitle",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=10.4,
        leading=13,
        textColor=PALETTE["ink"],
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        "BoxBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.9,
        leading=12.5,
        textColor=PALETTE["ink"],
        spaceAfter=0,
    )
)
styles.add(
    ParagraphStyle(
        "CodeCustom",
        fontName="Courier",
        fontSize=7.45,
        leading=9.25,
        textColor=PALETTE["code_fg"],
    )
)
styles.add(
    ParagraphStyle(
        "CodeTitle",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8.7,
        leading=11,
        textColor=PALETTE["white"],
    )
)
styles.add(
    ParagraphStyle(
        "TOCNumber",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=PALETTE["white"],
        alignment=TA_CENTER,
    )
)


def p(text: str, style: str = "BodyCustom") -> Paragraph:
    return Paragraph(text, styles[style])


def bullet(items: list[str], color=PALETTE["blue"]) -> ListFlowable:
    flow_items = []
    for item in items:
        flow_items.append(
            ListItem(
                Paragraph(item, styles["BodyCustom"]),
                bulletColor=color,
                leftIndent=8,
            )
        )
    return ListFlowable(
        flow_items,
        bulletType="bullet",
        start="circle",
        leftIndent=17,
        bulletFontSize=7,
        bulletColor=color,
        spaceAfter=5,
    )


def section_label(text: str, color=PALETTE["blue"]) -> Table:
    table = Table(
        [[Paragraph(text, styles["H1Custom"])]],
        colWidths=[CONTENT_W],
        style=[
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
            ("BOX", (0, 0), (-1, -1), 0, colors.white),
            ("LINEBELOW", (0, 0), (-1, -1), 4, color),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ],
    )
    table.hAlign = "LEFT"
    return table


def info_box(title: str, body: str, accent, bg, width=CONTENT_W) -> Table:
    title_p = Paragraph(title, styles["BoxTitle"])
    body_p = Paragraph(body, styles["BoxBody"])
    table = Table(
        [[title_p], [body_p]],
        colWidths=[width],
        style=[
            ("BACKGROUND", (0, 0), (-1, -1), bg),
            ("BOX", (0, 0), (-1, -1), 0.8, accent),
            ("LINEBEFORE", (0, 0), (0, -1), 6, accent),
            ("LEFTPADDING", (0, 0), (-1, -1), 11),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, 0), 8),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
            ("TOPPADDING", (0, 1), (-1, 1), 0),
            ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
            ("NOSPLIT", (0, 0), (-1, -1)),
        ],
    )
    table.hAlign = "LEFT"
    return table


def two_boxes(left_title: str, left_body: str, right_title: str, right_body: str):
    gutter = 0.35 * cm
    w = (CONTENT_W - gutter) / 2
    left = info_box(left_title, left_body, PALETTE["teal"], PALETTE["soft_teal"], w)
    right = info_box(right_title, right_body, PALETTE["amber"], PALETTE["soft_amber"], w)
    return Table(
        [[left, right]],
        colWidths=[w, w],
        style=[
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ],
    )


def code_block(title: str, code: str, accent=PALETTE["blue"]) -> Table:
    code = dedent(code).strip("\n")
    title_bar = Paragraph(escape(title), styles["CodeTitle"])
    pre = Preformatted(code, styles["CodeCustom"])
    table = Table(
        [[title_bar], [pre]],
        colWidths=[CONTENT_W],
        style=[
            ("BACKGROUND", (0, 0), (-1, 0), accent),
            ("BACKGROUND", (0, 1), (-1, 1), PALETTE["code_bg"]),
            ("BOX", (0, 0), (-1, -1), 0.6, accent),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, 0), 5),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 5),
            ("TOPPADDING", (0, 1), (-1, 1), 8),
            ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
        ],
    )
    table.hAlign = "LEFT"
    return table


def mini_table(headers: list[str], rows: list[list[str]], accent=PALETTE["blue"]) -> Table:
    data = [[Paragraph(h, styles["CodeTitle"]) for h in headers]]
    for row in rows:
        data.append([Paragraph(cell, styles["BoxBody"]) for cell in row])
    table = Table(data, colWidths=[CONTENT_W / len(headers)] * len(headers), repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), accent),
                ("TEXTCOLOR", (0, 0), (-1, 0), PALETTE["white"]),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#FFFFFF")),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#CBD5E1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


class COBOLPipeline(Flowable):
    def __init__(self):
        super().__init__()
        self.width = CONTENT_W
        self.height = 116

    def draw(self):
        c = self.canv
        stages = [
            ("Source", ".cbl file"),
            ("Compile", "syntax + object"),
            ("Link", "load module"),
            ("Run", "batch or CICS"),
            ("Data", "files / DB2"),
        ]
        box_w = (CONTENT_W - 36) / len(stages)
        x = 0
        y = 30
        colors_list = [
            PALETTE["blue"],
            PALETTE["teal"],
            PALETTE["amber"],
            PALETTE["coral"],
            PALETTE["green"],
        ]
        c.setFont("Helvetica", 8)
        for i, (title, sub) in enumerate(stages):
            fill = colors_list[i]
            c.setFillColor(fill)
            c.roundRect(x, y, box_w, 52, 7, fill=1, stroke=0)
            c.setFillColor(colors.white)
            c.setFont("Helvetica-Bold", 10)
            c.drawCentredString(x + box_w / 2, y + 32, title)
            c.setFont("Helvetica", 7.8)
            c.drawCentredString(x + box_w / 2, y + 17, sub)
            if i < len(stages) - 1:
                c.setStrokeColor(PALETTE["ink"])
                c.setLineWidth(1.6)
                c.line(x + box_w + 3, y + 26, x + box_w + 27, y + 26)
                c.line(x + box_w + 27, y + 26, x + box_w + 21, y + 31)
                c.line(x + box_w + 27, y + 26, x + box_w + 21, y + 21)
            x += box_w + 9


def on_page(canvas, doc):
    page = canvas.getPageNumber()
    canvas.saveState()
    if page == 1:
        canvas.setFillColor(PALETTE["ink"])
        canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        canvas.setFillColor(PALETTE["blue"])
        canvas.circle(PAGE_W - 30, PAGE_H - 35, 95, stroke=0, fill=1)
        canvas.setFillColor(PALETTE["teal"])
        canvas.circle(PAGE_W - 115, 105, 70, stroke=0, fill=1)
        canvas.setFillColor(PALETTE["amber"])
        canvas.circle(20, PAGE_H - 70, 55, stroke=0, fill=1)
    else:
        canvas.setFillColor(PALETTE["paper"])
        canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        canvas.setFillColor(colors.white)
        canvas.rect(0, PAGE_H - 1.17 * cm, PAGE_W, 1.17 * cm, stroke=0, fill=1)
        canvas.setFillColor(PALETTE["blue"])
        canvas.rect(0, PAGE_H - 1.17 * cm, PAGE_W, 0.12 * cm, stroke=0, fill=1)
        canvas.setFillColor(PALETTE["ink"])
        canvas.setFont("Helvetica-Bold", 8.5)
        canvas.drawString(MARGIN_X, PAGE_H - 0.78 * cm, "COBOL Basics")
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(PALETTE["muted"])
        canvas.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 0.78 * cm, f"Page {page}")
        canvas.setFillColor(PALETTE["muted"])
        canvas.setFont("Helvetica", 7.5)
        canvas.drawString(MARGIN_X, 0.72 * cm, "Original training guide - generated locally")
    canvas.restoreState()


def add_cover(story):
    story.append(Spacer(1, 4.8 * cm))
    story.append(p("COBOL Basics", "CoverTitle"))
    story.append(
        p(
            "A colorful, practical guide to reading and writing enterprise COBOL, "
            "with DB2, CICS, LINKAGE SECTION, and policy-update style examples.",
            "CoverSub",
        )
    )
    story.append(Spacer(1, 0.35 * cm))
    story.append(
        Table(
            [
                [
                    Paragraph("Beginner friendly", styles["CodeTitle"]),
                    Paragraph("Mainframe aware", styles["CodeTitle"]),
                    Paragraph("Example driven", styles["CodeTitle"]),
                ]
            ],
            colWidths=[CONTENT_W / 3] * 3,
            style=[
                ("BACKGROUND", (0, 0), (0, 0), PALETTE["teal"]),
                ("BACKGROUND", (1, 0), (1, 0), PALETTE["amber"]),
                ("BACKGROUND", (2, 0), (2, 0), PALETTE["coral"]),
                ("BOX", (0, 0), (-1, -1), 0, PALETTE["white"]),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ],
        )
    )
    story.append(Spacer(1, 2.0 * cm))
    story.append(
        p(
            "Note: The IBM-owned source you provided is used only as a conceptual "
            "reference. This PDF uses original examples and does not reproduce the "
            "licensed program body.",
            "CoverSub",
        )
    )
    story.append(PageBreak())


def add_toc(story):
    story.append(section_label("What you will learn", PALETTE["blue"]))
    story.append(
        p(
            "COBOL is verbose on purpose. It was designed so business rules can read "
            "like structured English and data layouts can map exactly to records, "
            "screens, database columns, and messages.",
        )
    )
    items = [
        ("01", "COBOL mental model", "Programs are data definitions plus paragraphs of procedural steps."),
        ("02", "Source format", "Columns, divisions, comments, and the period rules that surprise beginners."),
        ("03", "DATA DIVISION", "Level numbers, PIC clauses, groups, REDEFINES, FILLER, COMP, and 88 levels."),
        ("04", "PROCEDURE DIVISION", "MOVE, DISPLAY, COMPUTE, IF, EVALUATE, PERFORM, and loop patterns."),
        ("05", "Files and records", "SELECT, FD, OPEN, READ, WRITE, REWRITE, CLOSE, and file status."),
        ("06", "DB2 and CICS basics", "Host variables, SQLCA, cursors, indicators, LINKAGE SECTION, and COMMAREA."),
        ("07", "Reading LGUPDB01-style code", "How to recognize headers, working storage, cursor logic, and update flow."),
        ("08", "Practice and cheat sheets", "Exercises, review checklists, and compact reference tables."),
    ]
    data = []
    for number, title, desc in items:
        number_cell = Table(
            [[Paragraph(number, styles["TOCNumber"])]],
            colWidths=[1.0 * cm],
            rowHeights=[1.0 * cm],
            style=[
                ("BACKGROUND", (0, 0), (-1, -1), PALETTE["blue"]),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BOX", (0, 0), (-1, -1), 0, PALETTE["blue"]),
            ],
        )
        text_cell = Paragraph(f"<b>{title}</b><br/>{desc}", styles["BoxBody"])
        data.append([number_cell, text_cell])
    toc = Table(data, colWidths=[1.25 * cm, CONTENT_W - 1.25 * cm])
    toc.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(toc)
    story.append(Spacer(1, 0.2 * cm))
    story.append(COBOLPipeline())
    story.append(PageBreak())


def add_mental_model(story):
    story.append(section_label("1. COBOL mental model", PALETTE["teal"]))
    story.append(
        p(
            "A COBOL program is usually easier to read if you separate it into two "
            "questions: what data exists, and what steps are performed on that data. "
            "The DATA DIVISION answers the first question. The PROCEDURE DIVISION "
            "answers the second."
        )
    )
    story.append(
        two_boxes(
            "Think like a record processor",
            "Many COBOL programs read one business record, validate it, transform it, "
            "write output, then repeat. Even DB2 and CICS programs often keep this "
            "record-first style.",
            "Think like a contract keeper",
            "Data names, PIC clauses, copybooks, and LINKAGE items are contracts. "
            "Changing one field length can break files, screens, SQL host variables, "
            "and callers.",
        )
    )
    story.append(Spacer(1, 0.25 * cm))
    story.append(p("A tiny complete COBOL program", "H2Custom"))
    story.append(
        code_block(
            "HELLO.cbl",
            """
            IDENTIFICATION DIVISION.
            PROGRAM-ID. HELLO.

            DATA DIVISION.
            WORKING-STORAGE SECTION.
            01 WS-NAME        PIC X(20) VALUE "COBOL LEARNER".

            PROCEDURE DIVISION.
            MAIN-PARA.
                DISPLAY "HELLO, " WS-NAME
                STOP RUN.
            """,
            PALETTE["teal"],
        )
    )
    story.append(
        mini_table(
            ["Part", "Purpose"],
            [
                ["IDENTIFICATION DIVISION", "Names the program and can hold author or installation metadata."],
                ["DATA DIVISION", "Declares storage areas, record layouts, input/output buffers, and host variables."],
                ["PROCEDURE DIVISION", "Contains executable statements grouped into paragraphs or sections."],
                ["STOP RUN", "Ends a standalone batch-style program."],
            ],
            PALETTE["teal"],
        )
    )
    story.append(Spacer(1, 0.15 * cm))
    story.append(
        info_box(
            "Mainframe vocabulary",
            "A COBOL source file may become an object module after compilation and a load module after linking. "
            "Batch programs usually run under JCL. Online transaction programs often run under CICS and may "
            "receive data through DFHCOMMAREA.",
            PALETTE["blue"],
            PALETTE["soft_blue"],
        )
    )
    story.append(PageBreak())


def add_source_format(story):
    story.append(section_label("2. Source format and divisions", PALETTE["blue"]))
    story.append(
        p(
            "Classic COBOL uses fixed source format. Modern compilers also support "
            "free format, but many enterprise repositories still keep fixed-format "
            "rules because copybooks, tooling, and review habits grew around them."
        )
    )
    story.append(
        mini_table(
            ["Columns", "Name", "What they mean"],
            [
                ["1-6", "Sequence area", "Often blank today. Older shops used sequence numbers here."],
                ["7", "Indicator area", "`*` comment, `/` page eject, `-` continuation, `D` debug line."],
                ["8-11", "Area A", "Division, section, paragraph names, 01 and 77 level entries."],
                ["12-72", "Area B", "Most statements, subordinate levels, clauses, and expressions."],
                ["73-80", "Identification", "Ignored by many compilers; sometimes used by legacy tools."],
            ],
            PALETTE["blue"],
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(
        code_block(
            "Fixed-format landmarks",
            """
                   IDENTIFICATION DIVISION.
                   PROGRAM-ID. FORMAT1.
                  * This is a comment because column 7 contains *
                   DATA DIVISION.
                   WORKING-STORAGE SECTION.
                   01  WS-TOTAL       PIC 9(7)V99 VALUE 0.
                       05 WS-SUB-FIELD PIC X(10).
            """,
            PALETTE["blue"],
        )
    )
    story.append(p("The four common divisions", "H2Custom"))
    story.append(
        mini_table(
            ["Division", "Used for", "Notes"],
            [
                ["IDENTIFICATION", "Program identity", "Every program has it. `PROGRAM-ID` is required."],
                ["ENVIRONMENT", "Machine and file setup", "Maps logical file names to external files."],
                ["DATA", "Storage declarations", "Where most beginner confusion happens."],
                ["PROCEDURE", "Executable logic", "Paragraphs run in sequence unless control flow changes."],
            ],
            PALETTE["indigo"],
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(
        info_box(
            "Period rule",
            "A period ends a sentence. In older COBOL, a period after `IF` or `PERFORM` can accidentally end more "
            "scope than intended. Prefer explicit `END-IF`, `END-EVALUATE`, `END-PERFORM`, and then a period at "
            "the paragraph end.",
            PALETTE["coral"],
            PALETTE["soft_coral"],
        )
    )
    story.append(PageBreak())


def add_data_division(story):
    story.append(section_label("3. DATA DIVISION essentials", PALETTE["amber"]))
    story.append(
        p(
            "COBOL data declarations describe both the logical name and the physical "
            "shape of data. This is why COBOL can read packed decimal, fixed-length "
            "records, binary counters, dates stored as characters, and grouped "
            "business records very precisely."
        )
    )
    story.append(p("Level numbers", "H2Custom"))
    story.append(
        code_block(
            "Group item with elementary items",
            """
                   01  CUSTOMER-RECORD.
                       05 CUSTOMER-ID        PIC 9(10).
                       05 CUSTOMER-NAME      PIC X(30).
                       05 CUSTOMER-DOB.
                          10 DOB-YEAR        PIC 9(4).
                          10 DOB-MONTH       PIC 9(2).
                          10 DOB-DAY         PIC 9(2).
            """,
            PALETTE["amber"],
        )
    )
    story.append(
        mini_table(
            ["Level", "Meaning", "Example"],
            [
                ["01", "Top-level record or standalone group", "`01 WS-HEADER.`"],
                ["02-49", "Subordinate items inside a group", "`05 CUSTOMER-ID PIC 9(10).`"],
                ["66", "RENAMES, rarely used in new code", "`66 SHORT-NAME RENAMES ...`"],
                ["77", "Standalone scalar item", "`77 SQL-RETURN-CODE PIC S9(9) COMP.`"],
                ["88", "Condition name, like a named boolean", "`88 STATUS-OK VALUE '00'.`"],
            ],
            PALETTE["amber"],
        )
    )
    story.append(p("PIC clauses", "H2Custom"))
    story.append(
        mini_table(
            ["PIC", "Represents", "Example value"],
            [
                ["X(10)", "Alphanumeric, 10 characters", "`ABC123    `"],
                ["9(5)", "Unsigned display numeric", "`00125`"],
                ["S9(4)", "Signed numeric", "`-1234`"],
                ["9(7)V99", "Implied decimal", "`1234567.89` stored without a dot"],
                ["S9(9) COMP", "Signed binary integer", "Common for DB2 INTEGER host variables"],
                ["S9(7)V99 COMP-3", "Packed decimal", "Common for money and high-volume files"],
            ],
            PALETTE["teal"],
        )
    )
    story.append(Spacer(1, 0.15 * cm))
    story.append(
        info_box(
            "DISPLAY versus COMP versus COMP-3",
            "`DISPLAY` stores readable characters. `COMP` stores binary, which is compact and fast for counters. "
            "`COMP-3` stores packed decimal, which is compact and exact for business numbers such as money.",
            PALETTE["teal"],
            PALETTE["soft_teal"],
        )
    )
    story.append(PageBreak())

    story.append(section_label("4. Groups, REDEFINES, FILLER, and 88 levels", PALETTE["green"]))
    story.append(p("Group moves", "H2Custom"))
    story.append(
        p(
            "A group item has no PIC clause. Moving a group copies its bytes as a unit. "
            "That is useful for fixed records, headers, communication areas, and logs."
        )
    )
    story.append(
        code_block(
            "Group move",
            """
                   01 WS-FROM-ADDR.
                      05 FROM-CITY      PIC X(20) VALUE "PUNE".
                      05 FROM-STATE     PIC X(02) VALUE "MH".

                   01 WS-TO-ADDR.
                      05 TO-CITY        PIC X(20).
                      05 TO-STATE       PIC X(02).

                   MOVE WS-FROM-ADDR TO WS-TO-ADDR
            """,
            PALETTE["green"],
        )
    )
    story.append(p("REDEFINES", "H2Custom"))
    story.append(
        p(
            "`REDEFINES` lets two data descriptions share the same memory. Your sample "
            "uses this idea for date parsing: a character date can be viewed as year, "
            "month, and day fields without copying the bytes."
        )
    )
    story.append(
        code_block(
            "Date viewed two ways",
            """
                   01 WS-DATE-CHAR          PIC X(8) VALUE "20260514".
                   01 WS-DATE-PARTS REDEFINES WS-DATE-CHAR.
                      05 WS-DATE-YYYY       PIC 9(4).
                      05 WS-DATE-MM         PIC 9(2).
                      05 WS-DATE-DD         PIC 9(2).

                   DISPLAY WS-DATE-YYYY  *> 2026
            """,
            PALETTE["green"],
        )
    )
    story.append(
        mini_table(
            ["Feature", "What it does", "Why you see it"],
            [
                ["FILLER", "Unnamed bytes in a layout", "Separators, reserved bytes, or ignored fields."],
                ["VALUE", "Initial value", "Set constants, defaults, and flags."],
                ["REDEFINES", "Alternate view of same bytes", "Parse dates, headers, or variant records."],
                ["88 level", "Named condition on a field", "Make status tests readable."],
            ],
            PALETTE["green"],
        )
    )
    story.append(
        code_block(
            "88 condition names",
            """
                   01 WS-STATUS        PIC X(1) VALUE "N".
                      88 STATUS-NEW    VALUE "N".
                      88 STATUS-DONE   VALUE "D".
                      88 STATUS-ERROR  VALUE "E".

                   IF STATUS-NEW
                      DISPLAY "READY TO PROCESS"
                   END-IF
            """,
            PALETTE["teal"],
        )
    )
    story.append(PageBreak())


def add_procedure_division(story):
    story.append(section_label("5. PROCEDURE DIVISION basics", PALETTE["coral"]))
    story.append(
        p(
            "The PROCEDURE DIVISION is read top to bottom. Paragraphs are labels. "
            "Sections group paragraphs. Enterprise COBOL code often uses a structured "
            "paragraph numbering style such as `1000-INITIALIZE`, `2000-PROCESS`, "
            "and `9000-CLOSE`."
        )
    )
    story.append(
        code_block(
            "Structured paragraph flow",
            """
                   PROCEDURE DIVISION.
                   0000-MAIN.
                       PERFORM 1000-INITIALIZE
                       PERFORM 2000-PROCESS
                       PERFORM 9000-FINISH
                       GOBACK.

                   1000-INITIALIZE.
                       MOVE ZEROES TO WS-COUNT.

                   2000-PROCESS.
                       ADD 1 TO WS-COUNT.

                   9000-FINISH.
                       DISPLAY "COUNT=" WS-COUNT.
            """,
            PALETTE["coral"],
        )
    )
    story.append(
        mini_table(
            ["Verb", "Purpose", "Example"],
            [
                ["MOVE", "Assign a value", "`MOVE 'Y' TO WS-FOUND`"],
                ["DISPLAY", "Write text to output/log", "`DISPLAY WS-MSG`"],
                ["ACCEPT", "Read from system/user", "`ACCEPT WS-DATE FROM DATE YYYYMMDD`"],
                ["COMPUTE", "Arithmetic expression", "`COMPUTE WS-TAX = WS-AMT * 0.18`"],
                ["ADD/SUBTRACT", "Business arithmetic verbs", "`ADD 1 TO WS-COUNT`"],
                ["PERFORM", "Call paragraph or loop", "`PERFORM UNTIL END-OF-FILE`"],
            ],
            PALETTE["coral"],
        )
    )
    story.append(p("Selection with IF and EVALUATE", "H2Custom"))
    story.append(
        code_block(
            "IF and EVALUATE",
            """
                   IF WS-BALANCE < ZERO
                      MOVE "OVERDRAWN" TO WS-STATUS-TEXT
                   ELSE
                      MOVE "OK" TO WS-STATUS-TEXT
                   END-IF

                   EVALUATE WS-POLICY-TYPE
                      WHEN "H"  PERFORM UPDATE-HOME-POLICY
                      WHEN "M"  PERFORM UPDATE-MOTOR-POLICY
                      WHEN "E"  PERFORM UPDATE-ENDOWMENT-POLICY
                      WHEN OTHER PERFORM REPORT-BAD-TYPE
                   END-EVALUATE
            """,
            PALETTE["indigo"],
        )
    )
    story.append(PageBreak())

    story.append(section_label("6. Looping patterns", PALETTE["sky"]))
    story.append(
        p(
            "COBOL loops are usually written with `PERFORM`. Batch programs often loop "
            "until a file status or end-of-file flag changes. Table processing often "
            "uses `PERFORM VARYING`."
        )
    )
    story.append(
        code_block(
            "Loop until flag",
            """
                   01 WS-FILE-STATUS       PIC X(2).
                      88 FILE-OK           VALUE "00".
                      88 FILE-END          VALUE "10".

                   PERFORM UNTIL FILE-END
                      READ CUSTOMER-FILE
                         AT END SET FILE-END TO TRUE
                         NOT AT END PERFORM PROCESS-CUSTOMER
                      END-READ
                   END-PERFORM
            """,
            PALETTE["sky"],
        )
    )
    story.append(
        code_block(
            "Loop over a table",
            """
                   01 WS-SCORES.
                      05 WS-SCORE OCCURS 5 TIMES PIC 9(3).
                   01 WS-IDX                  PIC 9 VALUE 1.
                   01 WS-TOTAL                PIC 9(5) VALUE 0.

                   PERFORM VARYING WS-IDX FROM 1 BY 1
                       UNTIL WS-IDX > 5
                      ADD WS-SCORE(WS-IDX) TO WS-TOTAL
                   END-PERFORM
            """,
            PALETTE["teal"],
        )
    )
    story.append(
        info_box(
            "Avoid accidental fall-through",
            "A paragraph ends when the next paragraph label begins. Make the main paragraph explicitly perform "
            "the intended paragraphs and finish with `GOBACK` or `STOP RUN` as appropriate.",
            PALETTE["amber"],
            PALETTE["soft_amber"],
        )
    )
    story.append(PageBreak())


def add_files(story):
    story.append(section_label("7. File handling", PALETTE["indigo"]))
    story.append(
        p(
            "COBOL file handling is built around record layouts. The ENVIRONMENT "
            "DIVISION maps logical file names. The FILE SECTION describes the records. "
            "The PROCEDURE DIVISION opens, reads, writes, rewrites, and closes files."
        )
    )
    story.append(
        code_block(
            "Sequential input file",
            """
                   ENVIRONMENT DIVISION.
                   INPUT-OUTPUT SECTION.
                   FILE-CONTROL.
                       SELECT CUSTOMER-FILE ASSIGN TO "CUSTOMER.DAT"
                           ORGANIZATION IS LINE SEQUENTIAL
                           FILE STATUS IS WS-CUST-STATUS.

                   DATA DIVISION.
                   FILE SECTION.
                   FD CUSTOMER-FILE.
                   01 CUSTOMER-REC.
                      05 CUST-ID       PIC 9(10).
                      05 CUST-NAME     PIC X(30).

                   WORKING-STORAGE SECTION.
                   01 WS-CUST-STATUS   PIC X(2).
                      88 CUST-OK       VALUE "00".
                      88 CUST-EOF      VALUE "10".
            """,
            PALETTE["indigo"],
        )
    )
    story.append(
        code_block(
            "Read loop",
            """
                   OPEN INPUT CUSTOMER-FILE
                   PERFORM UNTIL CUST-EOF
                      READ CUSTOMER-FILE
                         AT END SET CUST-EOF TO TRUE
                         NOT AT END
                            DISPLAY CUST-ID " " CUST-NAME
                      END-READ
                   END-PERFORM
                   CLOSE CUSTOMER-FILE
            """,
            PALETTE["blue"],
        )
    )
    story.append(
        mini_table(
            ["Status", "Meaning", "Common reaction"],
            [
                ["00", "Successful operation", "Continue."],
                ["10", "End of file", "Stop read loop cleanly."],
                ["22", "Duplicate key", "Report or update instead of insert."],
                ["23", "Record not found", "Handle missing business key."],
                ["35", "File not found", "Check JCL DD name or file assignment."],
            ],
            PALETTE["indigo"],
        )
    )
    story.append(PageBreak())


def add_db2_cics(story):
    story.append(section_label("8. Embedded SQL and DB2", PALETTE["teal"]))
    story.append(
        p(
            "DB2 SQL inside COBOL is wrapped in `EXEC SQL` and `END-EXEC`. Values "
            "passed between COBOL and SQL are host variables. Inside SQL, host "
            "variables are prefixed with a colon."
        )
    )
    story.append(
        code_block(
            "Host variable and SQLCA pattern",
            """
                   WORKING-STORAGE SECTION.
                   01 DB2-CUSTOMER-ID       PIC S9(9) COMP.
                   01 DB2-POLICY-ID         PIC S9(9) COMP.
                   01 DB2-EXPIRY-DATE       PIC X(10).

                       EXEC SQL
                          INCLUDE SQLCA
                       END-EXEC.

                   PROCEDURE DIVISION.
                       MOVE 12345 TO DB2-CUSTOMER-ID
                       EXEC SQL
                          SELECT EXPIRYDATE
                            INTO :DB2-EXPIRY-DATE
                            FROM POLICY
                           WHERE CUSTOMERNUMBER = :DB2-CUSTOMER-ID
                       END-EXEC

                       IF SQLCODE = 0
                          DISPLAY "EXPIRY=" DB2-EXPIRY-DATE
                       ELSE
                          DISPLAY "DB2 ERROR SQLCODE=" SQLCODE
                       END-IF
            """,
            PALETTE["teal"],
        )
    )
    story.append(
        mini_table(
            ["DB2 concept", "COBOL shape", "Why it matters"],
            [
                ["INTEGER", "`PIC S9(9) COMP`", "Binary host variable for integer columns."],
                ["SMALLINT", "`PIC S9(4) COMP`", "Used for small counters and indicator variables."],
                ["DATE", "`PIC X(10)`", "Usually `YYYY-MM-DD` character format."],
                ["VARCHAR", "`49 length` plus `49 text`", "DB2 expects a length field followed by text bytes."],
                ["SQLCA", "`EXEC SQL INCLUDE SQLCA`", "Contains SQLCODE and diagnostics."],
            ],
            PALETTE["teal"],
        )
    )
    story.append(p("Indicator variables", "H2Custom"))
    story.append(
        p(
            "A nullable DB2 column needs an indicator variable. If DB2 returns NULL "
            "without an indicator, the fetch can fail. A negative indicator usually "
            "means NULL."
        )
    )
    story.append(
        code_block(
            "Nullable column",
            """
                   01 DB2-BROKER-REF      PIC X(20).
                   01 IND-BROKER-REF      PIC S9(4) COMP.

                       EXEC SQL
                          SELECT BROKERSREFERENCE
                            INTO :DB2-BROKER-REF :IND-BROKER-REF
                            FROM POLICY
                           WHERE POLICYNUMBER = :DB2-POLICY-ID
                       END-EXEC

                       IF IND-BROKER-REF < 0
                          MOVE SPACES TO DB2-BROKER-REF
                       END-IF
            """,
            PALETTE["green"],
        )
    )
    story.append(PageBreak())

    story.append(section_label("9. Cursors, locking, and updates", PALETTE["blue"]))
    story.append(
        p(
            "A cursor is a named SQL result set. Update programs often declare a cursor "
            "`FOR UPDATE OF` so the row can be fetched and then updated safely. Your "
            "example follows this enterprise pattern."
        )
    )
    story.append(
        code_block(
            "Cursor for update",
            """
                       EXEC SQL
                          DECLARE POLICY-CURSOR CURSOR WITH HOLD FOR
                             SELECT ISSUEDATE,
                                    EXPIRYDATE,
                                    BROKERID
                               FROM POLICY
                              WHERE CUSTOMERNUMBER = :DB2-CUSTOMER-ID
                                AND POLICYNUMBER   = :DB2-POLICY-ID
                              FOR UPDATE OF EXPIRYDATE,
                                            BROKERID
                       END-EXEC.

                       EXEC SQL OPEN POLICY-CURSOR END-EXEC
                       EXEC SQL
                          FETCH POLICY-CURSOR
                           INTO :DB2-ISSUE-DATE,
                                :DB2-EXPIRY-DATE,
                                :DB2-BROKER-ID :IND-BROKER-ID
                       END-EXEC
            """,
            PALETTE["blue"],
        )
    )
    story.append(
        mini_table(
            ["SQLCODE", "Meaning", "Typical action"],
            [
                ["0", "Success", "Continue."],
                ["100", "No row found or end of cursor", "Return not-found or finish loop."],
                ["-803", "Duplicate key", "Report conflicting key."],
                ["-911/-913", "Timeout or deadlock", "Rollback or retry according to shop standard."],
                ["other negative", "SQL error", "Log SQLCA fields and stop/update response."],
            ],
            PALETTE["blue"],
        )
    )
    story.append(
        info_box(
            "WITH HOLD",
            "`WITH HOLD` lets a cursor remain open across a commit in many DB2 environments. It is powerful, "
            "but commit/cursor behavior should be checked against your site standards.",
            PALETTE["amber"],
            PALETTE["soft_amber"],
        )
    )
    story.append(PageBreak())

    story.append(section_label("10. CICS, LINKAGE SECTION, and COMMAREA", PALETTE["coral"]))
    story.append(
        p(
            "CICS programs are often invoked by transactions or by other programs. "
            "Instead of reading a command line, they receive a communication area. "
            "That area is described in the LINKAGE SECTION because the storage is "
            "owned by the caller or by CICS, not by this program."
        )
    )
    story.append(
        code_block(
            "COMMAREA skeleton",
            """
                   DATA DIVISION.
                   WORKING-STORAGE SECTION.
                   01 WS-COMMAREA-LEN      PIC S9(4) COMP VALUE +0.

                   LINKAGE SECTION.
                   01 DFHCOMMAREA.
                      05 CA-REQUEST-ID     PIC X(8).
                      05 CA-CUSTOMER-ID    PIC 9(10).
                      05 CA-POLICY-ID      PIC 9(10).
                      05 CA-RETURN-CODE    PIC X(2).

                   PROCEDURE DIVISION.
                       IF EIBCALEN < LENGTH OF DFHCOMMAREA
                          MOVE "98" TO CA-RETURN-CODE
                          EXEC CICS RETURN END-EXEC
                       END-IF
            """,
            PALETTE["coral"],
        )
    )
    story.append(
        mini_table(
            ["Name", "What it is", "Why you saw it"],
            [
                ["DFHCOMMAREA", "Conventional name for CICS communication data", "Carries request/response fields."],
                ["EIBCALEN", "CICS length of supplied COMMAREA", "Used to validate input before referencing fields."],
                ["LINKAGE SECTION", "Storage passed in from outside", "Describes data the program does not allocate."],
                ["GOBACK", "Return to caller", "Common in called or CICS programs."],
                ["EXEC CICS", "CICS command wrapper", "Used for LINK, RETURN, SEND, RECEIVE, READ, WRITE, etc."],
            ],
            PALETTE["coral"],
        )
    )
    story.append(PageBreak())


def add_lgupdb_style(story):
    story.append(section_label("11. Reading LGUPDB01-style enterprise code", PALETTE["indigo"]))
    story.append(
        p(
            "The source you pasted looks like a CICS and DB2 policy-update program. "
            "Even without reading every line, you can quickly identify its intent by "
            "scanning the large structural landmarks."
        )
    )
    story.append(
        mini_table(
            ["Area in the sample", "What to notice", "Beginner translation"],
            [
                ["Header comments", "Program name and purpose", "This program updates policy details."],
                ["WS-HEADER", "Transaction, terminal, task, COMMAREA pointer", "Runtime trace and debug fields."],
                ["Date fields", "`REDEFINES` for year/month/day", "Parse dates without copying data."],
                ["ERROR-MSG", "Fixed log layout", "Build a consistent diagnostic message."],
                ["WS-COMMAREA-LENGTHS", "Required lengths", "Validate input message size."],
                ["WS-VARY-FIELD", "`49` length and character fields", "DB2 VARCHAR host variable layout."],
                ["DB2-IN-INTEGERS", "`S9(9) COMP` fields", "Host variables for numeric SQL columns."],
                ["SQL INCLUDEs", "`LGPOLICY`, `SQLCA`, `LGCMAREA`", "Copybooks expanded by precompiler/compiler."],
                ["Indicator vars", "`PIC S9(4) COMP`", "NULL handling for DB2 fetches."],
                ["Cursor declaration", "`FOR UPDATE OF ...`", "Select a row and lock/update specific columns."],
                ["LINKAGE SECTION", "`DFHCOMMAREA`", "Input/output structure passed by CICS caller."],
            ],
            PALETTE["indigo"],
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(
        KeepTogether(
            [
                p("A clean original version of the same shape", "H2Custom"),
                code_block(
                    "POLUPD01.cbl - simplified teaching skeleton",
                    """
                           IDENTIFICATION DIVISION.
                           PROGRAM-ID. POLUPD01.

                           ENVIRONMENT DIVISION.
                           DATA DIVISION.
                           WORKING-STORAGE SECTION.
                           01 WS-RUNTIME.
                              05 WS-TRANS-ID       PIC X(4).
                              05 WS-TASK-NO        PIC 9(7).
                              05 WS-COMMAREA-LEN   PIC S9(4) COMP.

                           01 DB2-HOST-VARS.
                              05 DB2-CUSTOMER-ID   PIC S9(9) COMP.
                              05 DB2-POLICY-ID     PIC S9(9) COMP.
                              05 DB2-EXPIRY-DATE   PIC X(10).

                               EXEC SQL INCLUDE SQLCA END-EXEC.

                           LINKAGE SECTION.
                           01 DFHCOMMAREA.
                              05 CA-CUSTOMER-ID    PIC 9(10).
                              05 CA-POLICY-ID      PIC 9(10).
                              05 CA-NEW-EXPIRY     PIC X(10).
                              05 CA-RETURN-CODE    PIC X(2).

                           PROCEDURE DIVISION.
                           MAIN-PARA.
                               PERFORM VALIDATE-INPUT
                               PERFORM UPDATE-POLICY
                               GOBACK.
                    """,
                    PALETTE["indigo"],
                ),
            ]
        )
    )
    story.append(PageBreak())

    story.append(section_label("12. Build a policy update flow", PALETTE["teal"]))
    story.append(
        p(
            "Below is a beginner-sized program flow for the same kind of work: validate "
            "COMMAREA length, move request values into DB2 host variables, execute an "
            "update, check SQLCODE, and return a response code."
        )
    )
    story.append(
        code_block(
            "Validation and DB2 update",
            """
                   VALIDATE-INPUT.
                       IF EIBCALEN < LENGTH OF DFHCOMMAREA
                          MOVE "98" TO CA-RETURN-CODE
                          GOBACK
                       END-IF

                       MOVE CA-CUSTOMER-ID TO DB2-CUSTOMER-ID
                       MOVE CA-POLICY-ID   TO DB2-POLICY-ID
                       MOVE CA-NEW-EXPIRY  TO DB2-EXPIRY-DATE.

                   UPDATE-POLICY.
                       EXEC SQL
                          UPDATE POLICY
                             SET EXPIRYDATE = :DB2-EXPIRY-DATE
                           WHERE CUSTOMERNUMBER = :DB2-CUSTOMER-ID
                             AND POLICYNUMBER   = :DB2-POLICY-ID
                       END-EXEC

                       EVALUATE SQLCODE
                          WHEN 0
                             MOVE "00" TO CA-RETURN-CODE
                          WHEN 100
                             MOVE "04" TO CA-RETURN-CODE
                          WHEN OTHER
                             MOVE "99" TO CA-RETURN-CODE
                       END-EVALUATE.
            """,
            PALETTE["teal"],
        )
    )
    story.append(
        info_box(
            "How to read enterprise COBOL faster",
            "First identify input, output, and return code fields. Then find SQL statements or file operations. "
            "After that, read validation paragraphs and error paragraphs. Only then study small data-move details.",
            PALETTE["blue"],
            PALETTE["soft_blue"],
        )
    )
    story.append(PageBreak())


def add_copybooks_debugging(story):
    story.append(section_label("13. Copybooks, naming, and debugging", PALETTE["amber"]))
    story.append(
        p(
            "Copybooks are reusable source fragments included during compile or SQL "
            "precompile. They usually hold record layouts, SQL declarations, constants, "
            "and shared communication area definitions."
        )
    )
    story.append(
        code_block(
            "COPY and SQL INCLUDE",
            """
                   DATA DIVISION.
                   WORKING-STORAGE SECTION.
                   COPY CUSTOMER-STATUS-CODES.

                       EXEC SQL
                          INCLUDE SQLCA
                       END-EXEC.

                   LINKAGE SECTION.
                   COPY POLICY-COMMAREA.
            """,
            PALETTE["amber"],
        )
    )
    story.append(
        mini_table(
            ["Prefix", "Common meaning", "Example"],
            [
                ["WS-", "Working-storage item", "`WS-RETRY-FLAG`"],
                ["CA-", "COMMAREA field", "`CA-RETURN-CODE`"],
                ["DB2-", "DB2 host variable", "`DB2-CUSTOMER-ID`"],
                ["IND-", "DB2 indicator", "`IND-BROKER-ID`"],
                ["ERR-/EM-", "Error message pieces", "`EM-SQLCODE`"],
                ["LK-", "Linkage item", "`LK-REQUEST`"],
            ],
            PALETTE["amber"],
        )
    )
    story.append(p("Debugging checklist", "H2Custom"))
    story.append(
        bullet(
            [
                "Check the exact input layout and length before trusting field values.",
                "Display or log key fields, SQLCODE, file status, and return code.",
                "For DB2 NULLs, confirm every nullable column has an indicator variable.",
                "For packed or binary data, verify the PIC and USAGE match the real data source.",
                "For CICS, check EIBCALEN and whether the caller expects a returned COMMAREA.",
                "For date logic, check character format, separators, and REDEFINES alignment.",
            ],
            PALETTE["amber"],
        )
    )
    story.append(
        info_box(
            "Why eye-catchers exist",
            "Fields such as `VALUE 'PROGRAM------WS'` make memory dumps easier to scan. If a dump shows that "
            "string, support staff can quickly find the program's working-storage area.",
            PALETTE["green"],
            PALETTE["soft_green"],
        )
    )
    story.append(PageBreak())


def add_practice(story):
    story.append(section_label("14. Practice exercises", PALETTE["green"]))
    story.append(p("Exercise 1: Declare a customer record", "H2Custom"))
    story.append(
        code_block(
            "Starter",
            """
                   01 CUSTOMER-REC.
                      05 CUSTOMER-ID        PIC 9(10).
                      05 CUSTOMER-NAME      PIC X(30).
                      05 CUSTOMER-STATUS    PIC X(1).
                         88 CUSTOMER-ACTIVE VALUE "A".
                         88 CUSTOMER-CLOSED VALUE "C".
            """,
            PALETTE["green"],
        )
    )
    story.append(
        bullet(
            [
                "Add a date of birth as `YYYYMMDD` and redefine it into year, month, and day.",
                "Add a signed account balance with two decimal places.",
                "Add a status display message using `EVALUATE CUSTOMER-STATUS`.",
            ],
            PALETTE["green"],
        )
    )
    story.append(p("Exercise 2: Read a policy update request", "H2Custom"))
    story.append(
        bullet(
            [
                "Create `DFHCOMMAREA` with customer number, policy number, new expiry date, and return code.",
                "Move the numeric request fields into DB2 host variables.",
                "Write an `EVALUATE SQLCODE` block for 0, 100, and other errors.",
            ],
            PALETTE["teal"],
        )
    )
    story.append(p("Exercise 3: Explain a code block", "H2Custom"))
    story.append(
        p(
            "Pick any 20 lines from an enterprise COBOL program and label each line as "
            "one of these: comment, data declaration, copybook/include, host variable, "
            "SQL statement, control flow, error handling, or return path."
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(
        info_box(
            "Review target",
            "You are ready to read LGUPDB01-style programs when you can explain why `SQLCA`, indicator variables, "
            "`DFHCOMMAREA`, `REDEFINES`, and `FOR UPDATE OF` appear in the same source file.",
            PALETTE["coral"],
            PALETTE["soft_coral"],
        )
    )
    story.append(PageBreak())


def add_cheatsheets(story):
    story.append(section_label("15. COBOL cheat sheets", PALETTE["blue"]))
    story.append(p("Data declaration quick reference", "H2Custom"))
    story.append(
        mini_table(
            ["Need", "Use", "Example"],
            [
                ["Text", "`PIC X(n)`", "`05 WS-NAME PIC X(30).`"],
                ["Whole number", "`PIC 9(n)`", "`05 WS-COUNT PIC 9(5).`"],
                ["Signed number", "`PIC S9(n)`", "`05 WS-DELTA PIC S9(5).`"],
                ["Decimal", "`V` implied decimal", "`05 WS-AMT PIC 9(7)V99.`"],
                ["Binary integer", "`COMP`", "`05 WS-ID PIC S9(9) COMP.`"],
                ["Packed decimal", "`COMP-3`", "`05 WS-MONEY PIC S9(9)V99 COMP-3.`"],
                ["Boolean-like state", "`88` level", "`88 END-OF-FILE VALUE 'Y'.`"],
                ["Alternate layout", "`REDEFINES`", "`01 WS-PARTS REDEFINES WS-DATE.`"],
            ],
            PALETTE["blue"],
        )
    )
    story.append(p("Procedure quick reference", "H2Custom"))
    story.append(
        mini_table(
            ["Task", "Pattern"],
            [
                ["Assign", "`MOVE source TO target`"],
                ["Add", "`ADD amount TO total`"],
                ["Calculate", "`COMPUTE result = price * quantity`"],
                ["Branch", "`IF condition ... ELSE ... END-IF`"],
                ["Multi-branch", "`EVALUATE value WHEN ... END-EVALUATE`"],
                ["Call paragraph", "`PERFORM 2000-PROCESS`"],
                ["Loop", "`PERFORM UNTIL condition ... END-PERFORM`"],
                ["Return", "`GOBACK` for called programs, `STOP RUN` for standalone programs"],
            ],
            PALETTE["teal"],
        )
    )
    story.append(p("Enterprise reading order", "H2Custom"))
    story.append(
        bullet(
            [
                "Start with `PROGRAM-ID` and top comments to understand the business action.",
                "Find input and output data: `LINKAGE SECTION`, file records, screen maps, or SQL host variables.",
                "Find external operations: `EXEC SQL`, `EXEC CICS`, `READ`, `WRITE`, `CALL`.",
                "Find return codes and error-message construction.",
                "Read the main paragraph, then follow the `PERFORM` chain.",
                "Map data moves from request fields to host variables to update/output fields.",
            ],
            PALETTE["blue"],
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(
        KeepTogether(
            [
                info_box(
                    "Final mental shortcut",
                    "COBOL is not hard because the verbs are mysterious. It is hard because the data contracts are precise. "
                    "When you understand the record layouts, the procedure logic becomes much easier.",
                    PALETTE["indigo"],
                    PALETTE["soft_indigo"],
                ),
                Spacer(1, 0.18 * cm),
                p("Beginner glossary", "H2Custom"),
                mini_table(
                    ["Term", "Meaning"],
                    [
                        ["Copybook", "Reusable source fragment copied into a program at compile or precompile time."],
                        ["Host variable", "COBOL field referenced by embedded SQL using a leading colon."],
                        ["Indicator variable", "Small binary field that tells DB2 whether a nullable column is NULL."],
                        ["COMMAREA", "CICS communication area passed between a caller and a called program."],
                        ["SQLCA", "DB2 communication area containing SQLCODE and diagnostic details."],
                    ],
                    PALETTE["indigo"],
                ),
            ]
        )
    )


def build():
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        rightMargin=MARGIN_X,
        leftMargin=MARGIN_X,
        topMargin=MARGIN_TOP,
        bottomMargin=MARGIN_BOTTOM,
        title="COBOL Basics - Colorful Training Guide",
        author="Generated locally with Codex",
        subject="COBOL beginner guide with DB2 and CICS patterns",
    )
    story = []
    add_cover(story)
    add_toc(story)
    add_mental_model(story)
    add_source_format(story)
    add_data_division(story)
    add_procedure_division(story)
    add_files(story)
    add_db2_cics(story)
    add_lgupdb_style(story)
    add_copybooks_debugging(story)
    add_practice(story)
    add_cheatsheets(story)
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(OUT)


if __name__ == "__main__":
    build()
