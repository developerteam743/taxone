from fastapi import FastAPI, UploadFile, File
import re
app=FastAPI(title='TaxOne OCR Service',version='1.0')
@app.get('/health')
def health(): return {'ok':True,'provider':'mock'}
@app.post('/extract')
async def extract(file:UploadFile=File(...)):
    data=await file.read()
    # Local deterministic fallback: keeps the pipeline runnable without paid OCR credentials.
    text=data.decode('utf-8','ignore') if file.filename and file.filename.lower().endswith(('.txt','.csv')) else ''
    gst=re.search(r'\b\d{2}[A-Z0-9]{13}\b',text.upper())
    inv=re.search(r'(?:invoice|inv)[\s:#-]*([A-Z0-9/-]+)',text,re.I)
    return {'rawText':text,'structured':{'supplierGstin':gst.group(0) if gst else None,'invoiceNumber':inv.group(1) if inv else None},'confidence':0.35 if text else 0.0,'schemaVersion':'1.0'}
