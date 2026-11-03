"""Small helpers that emit WordprocessingML matching the formatting of the department template."""
import re
from xml.sax.saxutils import escape

from PIL import Image

TEXT_WIDTH_TWIPS = 9026  # A4 minus 1" margins, as in the template
EMU_PER_TWIP = 635


def esc(t):
    return escape(t)


def _runs(text, size=None, italic=False, bold=False, mono=False, color=None):
    """Turn **bold** and `code` markup into runs."""
    out = []
    for part in re.split(r"(\*\*.+?\*\*|`.+?`)", text):
        if not part:
            continue
        b, code = bold, mono
        if part.startswith("**") and part.endswith("**"):
            part, b = part[2:-2], True
        elif part.startswith("`") and part.endswith("`"):
            part, code = part[1:-1], True
        rpr = ""
        if code:
            rpr += '<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/>'
        if b:
            rpr += "<w:b/>"
        if italic:
            rpr += "<w:i/><w:iCs/>"
        if color:
            rpr += f'<w:color w:val="{color}"/>'
        sz = size or (20 if code else None)
        if sz:
            rpr += f'<w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/>'
        out.append(f'<w:r>{"<w:rPr>" + rpr + "</w:rPr>" if rpr else ""}<w:t xml:space="preserve">{esc(part)}</w:t></w:r>')
    return "".join(out)


def p(text, jc="both", after=120, size=None, italic=False, bold=False, keep_next=False):
    ppr = f'<w:pPr>{"<w:keepNext/>" if keep_next else ""}<w:spacing w:after="{after}" w:line="276" w:lineRule="auto"/><w:jc w:val="{jc}"/></w:pPr>'
    return f"<w:p>{ppr}{_runs(text, size, italic, bold)}</w:p>"


def h1(text):
    return f'<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:pageBreakBefore/></w:pPr><w:r><w:t>{esc(text)}</w:t></w:r></w:p>'


def h2(text):
    return f'<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>{esc(text)}</w:t></w:r></w:p>'


def bullet(text):
    return (
        '<w:p><w:pPr><w:pStyle w:val="ListBullet"/><w:tabs><w:tab w:val="num" w:pos="360"/></w:tabs>'
        '<w:ind w:left="360" w:hanging="360"/><w:jc w:val="both"/></w:pPr>'
        f'{_runs(text, size=24)}</w:p>'
    )


def caption(text, keep_next=False):
    return (
        f'<w:p><w:pPr>{"<w:keepNext/>" if keep_next else ""}<w:spacing w:before="60" w:after="200"/><w:jc w:val="center"/></w:pPr>'
        f'<w:r><w:rPr><w:i/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">{esc(text)}</w:t></w:r></w:p>'
    )


def code_block(lines):
    out = []
    for i, ln in enumerate(lines):
        before = "60" if i == 0 else "0"
        after = "160" if i == len(lines) - 1 else "0"
        out.append(
            f'<w:p><w:pPr><w:keepLines/><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/><w:spacing w:before="{before}" w:after="{after}"/>'
            '<w:ind w:left="240" w:right="240"/></w:pPr>'
            f'<w:r><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/><w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr>'
            f'<w:t xml:space="preserve">{esc(ln)}</w:t></w:r></w:p>'
        )
    return "".join(out)


def _cell(text, width, header=False, align="left"):
    shd = '<w:shd w:val="clear" w:color="auto" w:fill="D9E1F2"/>' if header else ""
    valign = "" if header else "<w:vAlign w:val=\"center\"/>"
    runs = _runs(text, size=18, bold=header)
    return (
        f'<w:tc><w:tcPr><w:tcW w:w="{width}" w:type="dxa"/>{shd}{valign}</w:tcPr>'
        f'<w:p><w:pPr><w:spacing w:before="20" w:after="20"/><w:jc w:val="{align}"/></w:pPr>{runs}</w:p></w:tc>'
    )


def table(header, rows, widths):
    assert sum(widths) == TEXT_WIDTH_TWIPS, sum(widths)
    grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in widths)
    out = [
        '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:jc w:val="center"/>'
        '<w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr>'
        f"<w:tblGrid>{grid}</w:tblGrid>"
    ]
    out.append('<w:tr><w:trPr><w:cantSplit/><w:tblHeader/><w:jc w:val="center"/></w:trPr>' + "".join(_cell(h, w, True) for h, w in zip(header, widths)) + "</w:tr>")
    for r in rows:
        out.append('<w:tr><w:trPr><w:cantSplit/><w:jc w:val="center"/></w:trPr>' + "".join(_cell(c, w) for c, w in zip(r, widths)) + "</w:tr>")
    out.append("</w:tbl>")
    out.append('<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>')
    return "".join(out)


def image(rid, docpr_id, path, width_twips):
    with Image.open(path) as im:
        w, h = im.size
    cx = int(width_twips * EMU_PER_TWIP)
    cy = int(cx * h / w)
    name = path.replace("\\", "/").split("/")[-1]
    return (
        '<w:p><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="60"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing>'
        f'<wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="{cx}" cy="{cy}"/><wp:docPr id="{docpr_id}" name="{esc(name)}" descr="{esc(name)}"/>'
        '<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>'
        '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
        '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
        f'<pic:nvPicPr><pic:cNvPr id="{docpr_id}" name="{esc(name)}"/><pic:cNvPicPr/></pic:nvPicPr>'
        f'<pic:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
        f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
        "</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>"
    )
