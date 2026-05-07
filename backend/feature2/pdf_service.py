"""
PDF Generation Service
======================

This module handles the generation of PDF documents for the application.
It uses the ReportLab library to create professional-quality reports and forms.

Services provided:
1. Claim Form Generation: Creates a PMFBY insurance claim form.
2. Analysis Report Generation: Creates a detailed crop health diagnosis report.
"""

import io
import json
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, ListFlowable, ListItem
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT

class PDFService:
    """
    Service class for generating PDF documents.
    """

    @staticmethod
    def generate_claim_form(data: Dict[str, Any]) -> bytes:
        """
        Generates a standardized PMFBY Crop Loss Claim Form.

        Args:
            data: Dictionary containing farmer and claim details.

        Returns:
            bytes: The binary content of the generated PDF.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4, 
            rightMargin=40, leftMargin=40, 
            topMargin=40, bottomMargin=40,
            title="PMFBY Claim Form"
        )
        
        styles = getSampleStyleSheet()
        # --- Custom Styles ---
        title_style = ParagraphStyle(
            'Title', parent=styles['Heading1'], 
            alignment=TA_CENTER, fontSize=18, spaceAfter=20, textColor=colors.darkblue
        )
        subtitle_style = ParagraphStyle(
            'SubTitle', parent=styles['Heading2'], 
            fontSize=14, spaceAfter=10, textColor=colors.black, keepWithNext=True
        )
        normal_style = styles['Normal']
        normal_style.fontSize = 10
        normal_style.leading = 14
        
        elements = []

        # --- HEADER ---
        elements.append(Paragraph("PRADHAN MANTRI FASAL BIMA YOJANA (PMFBY)", title_style))
        elements.append(Paragraph(f"CROP LOSS CLAIM FORM - {datetime.now().year}", subtitle_style))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("<i>(Under Ministry of Agriculture & Farmers Welfare, Govt. of India)</i>", ParagraphStyle('CenteredItalic', parent=normal_style, alignment=TA_CENTER)))
        elements.append(Spacer(1, 20))

        # --- SECTION 1: FARMER DETAILS ---
        elements.append(Paragraph("1. FARMER DETAILS", subtitle_style))
        
        details_data = [
            ["Farmer Name:", data.get("farmer_name", "")],
            ["Father/Husband Name:", data.get("guardian_name", "")],
            ["Mobile No:", data.get("mobile", "")],
            ["Aadhaar No:", data.get("aadhaar", "")],
            ["Address:", data.get("address", "")],
        ]
        
        t1 = PDFService._create_form_table(details_data)
        elements.append(t1)
        elements.append(Spacer(1, 15))

        # --- SECTION 2: BANK DETAILS ---
        elements.append(Paragraph("2. BANK ACCOUNT DETAILS (For DBT)", subtitle_style))
        bank_data = [
            ["Account Holder Name:", data.get("account_holder", data.get("farmer_name", ""))],
            ["Bank Name:", data.get("bank_name", "")],
            ["Branch Name:", data.get("branch_name", "")],
            ["Account Number:", data.get("account_number", "")],
            ["IFSC Code:", data.get("ifsc", "")],
        ]
        t2 = PDFService._create_form_table(bank_data)
        elements.append(t2)
        elements.append(Spacer(1, 15))

        # --- SECTION 3: LAND & CROP DETAILS ---
        elements.append(Paragraph("3. CROP LOSS DETAILS", subtitle_style))
        crop_data = [
            ["Survey/Khasra No:", data.get("survey_no", "")],
            ["Village/Tehsil:", data.get("village", "")],
            ["Crop Name:", data.get("crop_name", "")],
            ["Sowing Date:", data.get("sowing_date", "")],
            ["Area Insured (Ha):", data.get("area_insured", "")],
            ["Date of Loss:", data.get("loss_date", "")],
            ["Cause of Loss:", data.get("loss_cause", "")],
            ["Est. Loss %:", f"{data.get('loss_percentage', '0')}%"],
        ]
        t3 = PDFService._create_form_table(crop_data)
        elements.append(t3)
        elements.append(Spacer(1, 25))

        # --- DECLARATION ---
        elements.append(Paragraph("DECLARATION", subtitle_style))
        decl_text = "I hereby declare that the particulars given above are true and correct to the best of my knowledge and belief. I have not claimed any compensation for the same loss from any other source. I authorize the insurance company to inspect my field."
        elements.append(Paragraph(decl_text, normal_style))
        
        elements.append(Spacer(1, 50))
        
        # --- SIGNATURES ---
        sig_data = [
            ["__________________________", "__________________________"],
            ["Signature of Farmer", "Signature of Authority (Patwari/Sarpanch)"],
            [f"Date: {datetime.now().strftime('%d-%m-%Y')}", "Seal:"]
        ]
        t_sig = Table(sig_data, colWidths=[250, 250])
        t_sig.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        elements.append(t_sig)

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_analysis_report(data: Dict[str, Any]) -> bytes:
        """
        Generates a comprehensive Crop Health Analysis Report.
        
        Args:
            data: Dictionary containing diagnosis and treatment plan.
                  Expected keys: disease_class, confidence, analysis_report, treatment_plan (JSON/Dict)
        
        Returns:
            bytes: Binary content of the PDF.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4,
            rightMargin=40, leftMargin=40, 
            topMargin=40, bottomMargin=40,
            title="Crop Health Report"
        )
        
        styles = getSampleStyleSheet()
        
        # --- Styles ---
        title_style = ParagraphStyle('ReportTitle', parent=styles['Heading1'], alignment=TA_CENTER, fontSize=20, textColor=colors.darkgreen, spaceAfter=20)
        h2_style = ParagraphStyle('ReportH2', parent=styles['Heading2'], fontSize=14, textColor=colors.darkolivegreen, spaceBefore=15, spaceAfter=10, borderPadding=5, borderColor=colors.lightgrey, borderWidth=0, borderRadius=5)
        h3_style = ParagraphStyle('ReportH3', parent=styles['Heading3'], fontSize=12, textColor=colors.black, spaceBefore=10)
        normal_style = styles['Normal']
        warning_style = ParagraphStyle('Warning', parent=normal_style, textColor=colors.red, fontSize=11)
        
        elements = []
        
        # --- 1. Header ---
        elements.append(Paragraph("CROP HEALTH DIAGNOSIS REPORT", title_style))
        elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%d %B, %Y')}", ParagraphStyle('Date', parent=normal_style, alignment=TA_CENTER)))
        elements.append(Spacer(1, 20))
        
        # --- 2. Diagnosis Result ---
        disease_name = data.get("disease_class", "Unknown")
        confidence = data.get("confidence", 0.0)
        
        # Color code based on confidence
        conf_color = colors.green if confidence > 0.8 else (colors.orange if confidence > 0.5 else colors.red)
        
        diag_data = [
            [Paragraph("<b>Detected Condition:</b>", normal_style), Paragraph(f"<font size=14 color='darkred'><b>{disease_name}</b></font>", normal_style)],
            [Paragraph("<b>Confidence Score:</b>", normal_style), Paragraph(f"<font color={conf_color}>{confidence*100:.1f}%</font>", normal_style)]
        ]
        
        t_diag = Table(diag_data, colWidths=[150, 300])
        t_diag.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
            ('BACKGROUND', (0,0), (0,-1), colors.whitesmoke),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(t_diag)
        elements.append(Spacer(1, 15))
        
        # --- 3. Expert Analysis ---
        elements.append(Paragraph("EXPERT ANALYSIS", h2_style))
        elements.append(Paragraph(data.get("analysis_report", "No analysis provided."), normal_style))
        elements.append(Spacer(1, 10))
        
        # Parse Treatment Plan (It might be a JSON string or a Dict)
        tp = data.get("treatment_plan")
        if isinstance(tp, str):
            try:
                tp = json.loads(tp)
            except:
                tp = {}
        
        if not isinstance(tp, dict):
            tp = {}

        # Explanation from JSON (if available and different from main report)
        if "explanation" in tp and tp["explanation"] != data.get("analysis_report"):
             elements.append(Paragraph(f"<b>Visual Symptoms:</b> {tp['explanation']}", normal_style))
        
        # --- 4. Treatment Plan ---
        elements.append(Paragraph("RECOMMENDED TREATMENT PLAN", h2_style))
        
        # Organic
        if "treatment" in tp and "organic" in tp["treatment"] and tp["treatment"]["organic"]:
            elements.append(Paragraph("Option A: Organic / Biological Control", h3_style))
            org_data = [["Product", "Type", "Dosage / Usage"]]
            for item in tp["treatment"]["organic"]:
                org_data.append([
                    Paragraph(item.get("item", ""), normal_style),
                    Paragraph(item.get("description", ""), normal_style),
                    Paragraph(item.get("usage", ""), normal_style)
                ])
            
            t_org = Table(org_data, colWidths=[150, 120, 180])
            t_org.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.lightgreen), # Header
                ('TEXTCOLOR', (0,0), (-1,0), colors.darkgreen),
                ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            elements.append(t_org)
            elements.append(Spacer(1, 10))

        # Chemical
        if "treatment" in tp and "chemical" in tp["treatment"] and tp["treatment"]["chemical"]:
            elements.append(Paragraph("Option B: Chemical Intervention", h3_style))
            chem_data = [["Product", "Type", "Dosage / Usage"]]
            for item in tp["treatment"]["chemical"]:
                chem_data.append([
                    Paragraph(item.get("item", ""), normal_style),
                    Paragraph(item.get("description", ""), normal_style),
                    Paragraph(item.get("usage", ""), normal_style)
                ])
            
            t_chem = Table(chem_data, colWidths=[150, 120, 180])
            t_chem.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.mistyrose), # Header
                ('TEXTCOLOR', (0,0), (-1,0), colors.darkred),
                ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            elements.append(t_chem)

        # --- 5. Action Timeline ---
        if "timeline" in tp and tp["timeline"]:
            elements.append(Spacer(1, 15))
            elements.append(Paragraph("ACTION TIMELINE", h2_style))
            
            for step in tp["timeline"]:
                day = step.get("day", "Day X")
                title = step.get("title", "Action")
                task = step.get("task", "")
                
                # Bullet point style
                bullet_text = f"<b>[{day}] {title}:</b> {task}"
                elements.append(Paragraph(bullet_text, normal_style, bulletText="•"))
                elements.append(Spacer(1, 5))

        # --- 6. Disclaimer ---
        elements.append(Spacer(1, 30))
        disclaimer_text = "<b>DISCLAIMER:</b> This report is generated by an AI Agent based on the image provided. While it offers expert-level advice, it is recommended to consult a local agricultural extension officer before applying large-scale chemical treatments. Safety precautions must be followed while handling chemicals."
        elements.append(Paragraph(disclaimer_text, ParagraphStyle('Disclaimer', parent=normal_style, fontSize=8, textColor=colors.grey, alignment=TA_JUSTIFY)))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def _create_form_table(data_rows: List[List[str]]) -> Table:
        """Helper to create standard form tables."""
        t = Table(data_rows, colWidths=[150, 300])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), colors.whitesmoke),
            ('TEXTCOLOR', (0,0), (0,-1), colors.black),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ]))
        return t

        elements.append(Spacer(1, 40))

        # --- SIGNATURES ---
        sig_data = [
            ["_______________________", "_______________________"],
            ["Signature of Farmer", "Signature of Village Official/Patwari"],
            ["Date: ____________", "Seal: _________________"]
        ]
        t4 = Table(sig_data, colWidths=[250, 250])
        t4.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
            ('TOPPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(t4)
        
        # --- FOOTER LOGIC (Simplified) ---
        # Add a generated footer? 
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("Generated by SankatSaathi AI • Supporting Indian Farmers", ParagraphStyle('Footer', parent=normal_style, alignment=TA_CENTER, fontSize=8, textColor=colors.grey)))


        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
