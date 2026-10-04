import sys
import os
from pypdf import PdfReader

def extract_pdf_text(pdf_path: str, start_page: int = 1, end_page: int = None) -> str:
    """Extract text from a PDF file between start_page and end_page (1-based index)."""
    if not os.path.exists(pdf_path):
        print(f"Error: File '{pdf_path}' not found.", file=sys.stderr)
        sys.exit(1)

    try:
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)
        if end_page is None or end_page > total_pages:
            end_page = total_pages

        extracted_text = []
        for pno in range(start_page - 1, end_page):
            page = reader.pages[pno]
            text = page.extract_text() or ""
            extracted_text.append(f"--- PAGE {pno + 1} / {total_pages} ---\n{text}")

        return "\n\n".join(extracted_text)
    except Exception as e:
        print(f"Error extracting PDF: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_pdf.py <path_to_pdf> [start_page] [end_page]")
        sys.exit(1)

    pdf_file = sys.argv[1]
    s_page = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    e_page = int(sys.argv[3]) if len(sys.argv) > 3 else None

    result = extract_pdf_text(pdf_file, s_page, e_page)
    print(result)
