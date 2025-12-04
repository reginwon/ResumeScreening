"""
PDF parsing utilities for extracting text from resume PDFs
"""
import io
from typing import Union
import PyPDF2


def extract_text_from_pdf(pdf_content: Union[bytes, io.BytesIO]) -> str:
    """
    Extract text content from a PDF file
    
    Args:
        pdf_content: PDF file as bytes or BytesIO object
        
    Returns:
        Extracted text as a string
        
    Raises:
        Exception: If PDF parsing fails
    """
    try:
        # Convert bytes to BytesIO if needed
        if isinstance(pdf_content, bytes):
            pdf_file = io.BytesIO(pdf_content)
        else:
            pdf_file = pdf_content
        
        # Create PDF reader
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from all pages
        text_parts = []
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text_parts.append(page.extract_text())
        
        # Combine all text
        full_text = "\n".join(text_parts)
        
        # Clean up the text (remove excessive whitespace)
        full_text = " ".join(full_text.split())
        
        return full_text
        
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")


def validate_pdf(pdf_content: bytes) -> bool:
    """
    Validate that the content is a valid PDF
    
    Args:
        pdf_content: PDF file as bytes
        
    Returns:
        True if valid PDF, False otherwise
    """
    try:
        pdf_file = io.BytesIO(pdf_content)
        PyPDF2.PdfReader(pdf_file)
        return True
    except:
        return False
