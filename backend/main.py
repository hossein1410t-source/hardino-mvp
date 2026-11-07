from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI(title="Hardware Marketplace Python API")

# تنظیمات دسترسی مرورگر از مبدا localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FeeRequest(BaseModel):
    price: int
    verification_type: str

class BuilderCheckRequest(BaseModel):
    device_type: str = "DESKTOP"
    usage: str = "GAMING"
    gpu_model: str = ""
    ram_spec: str = ""
    storage_spec: str = ""
    user_psu_watts: int = 600

@app.get("/api/health")
def health_check():
    return {"status": "ok", "engine": "Python FastAPI is active!"}

@app.post("/api/calculate-seller-payout")
def calculate_payout(req: FeeRequest):
    platform_fee = int(req.price * 0.03)
    test_fee = 0 if req.verification_type == "ON_DEMAND" else 250000
    net_payout = req.price - platform_fee - test_fee
    tracking_code = f"TH-{random.randint(10000, 99999)}"
    
    return {
        "tracking_code": tracking_code,
        "platform_fee": platform_fee,
        "test_fee": test_fee,
        "net_payout": max(net_payout, 0)
    }

@app.post("/api/analyze-build")
def analyze_build(req: BuilderCheckRequest):
    warnings = []
    tips = []
    estimated_wattage = 150

    if req.device_type == "LAPTOP" and req.gpu_model:
        warnings.append("کارت گرافیک دسکتاپ (PCIe) بدون باکس اکسترنال eGPU درون لپ‌تاپ قابل نصب نیست.")

    if any(k in req.gpu_model for k in ["3080", "3090", "4080", "4090"]):
        estimated_wattage += 340
    elif any(k in req.gpu_model for k in ["3070", "3060", "4060", "6700"]):
        estimated_wattage += 200
    elif req.gpu_model:
        estimated_wattage += 140

    if req.ram_spec:
        estimated_wattage += 15
    if req.storage_spec:
        estimated_wattage += 10

    recommended_psu = int(estimated_wattage * 1.3)
    if req.device_type == "DESKTOP" and req.user_psu_watts < recommended_psu:
        warnings.append(f"توان پاور ({req.user_psu_watts}W) کمتر از توان پیشنهادی ({recommended_psu}W) است.")
    else:
        tips.append(f"پاور انتخابی ({req.user_psu_watts}W) پوشش‌دهنده کامل پیک مصرف است.")

    return {
        "compatible": len(warnings) == 0,
        "compatibility_score": max(100 - (len(warnings) * 35), 20),
        "estimated_wattage": estimated_wattage,
        "recommended_psu": recommended_psu,
        "warnings": warnings,
        "tips": tips
    }

@app.post("/api/analyze-benchmark-image")
async def analyze_benchmark_image():
    # شبیه‌سازی پردازش هوش مصنوعی ویژن روی تصویر آپلودشده بنچمارک
    # در نسخه واقعی می‌توانید کلید Gemini API را در اینجا قرار دهید تا عکس FurMark یا 3DMark را بخواند.
    import random
    
    simulated_temp = random.randint(64, 78)
    simulated_hotspot = simulated_temp + random.randint(10, 15)
    simulated_score = random.randint(11000, 14500)
    is_stable = random.choice([True, True, True, False])
    
    return {
        "success": True,
        "engine": "Gemini Vision AI & Python OpenCV 🐍",
        "extracted_metrics": {
            "max_temp": simulated_temp,
            "hotspot_temp": simulated_hotspot,
            "fan_speed_pct": random.randint(50, 75),
            "3dmark_score": simulated_score,
            "bios_authentic": True,
            "stability_test_passed": is_stable
        },
        "health_grade": "GRADE_A" if simulated_temp < 75 and is_stable else "GRADE_B",
        "overall_score": 94 if is_stable else 78,
        "technician_note": "تصویر بنچمارک با موفقیت توسط هوش مصنوعی اسکن شد؛ پایداری ولتاژ و حرارت هسته در محدوده استاندارد کارخانه تایید می‌گردد."
    }

@app.post("/api/analyze-benchmark-image")
async def analyze_benchmark_image():
    # شبیه‌سازی پردازش هوش مصنوعی ویژن روی تصویر آپلودشده بنچمارک
    # در نسخه واقعی می‌توانید کلید Gemini API را در اینجا قرار دهید تا عکس FurMark یا 3DMark را بخواند.
    import random
    
    simulated_temp = random.randint(64, 78)
    simulated_hotspot = simulated_temp + random.randint(10, 15)
    simulated_score = random.randint(11000, 14500)
    is_stable = random.choice([True, True, True, False])
    
    return {
        "success": True,
        "engine": "Gemini Vision AI & Python OpenCV 🐍",
        "extracted_metrics": {
            "max_temp": simulated_temp,
            "hotspot_temp": simulated_hotspot,
            "fan_speed_pct": random.randint(50, 75),
            "3dmark_score": simulated_score,
            "bios_authentic": True,
            "stability_test_passed": is_stable
        },
        "health_grade": "GRADE_A" if simulated_temp < 75 and is_stable else "GRADE_B",
        "overall_score": 94 if is_stable else 78,
        "technician_note": "تصویر بنچمارک با موفقیت توسط هوش مصنوعی اسکن شد؛ پایداری ولتاژ و حرارت هسته در محدوده استاندارد کارخانه تایید می‌گردد."
    }

class PaymentVerifyRequest(BaseModel):
    order_id: str
    amount: int

@app.post("/api/verify-payment")
def verify_payment(req: PaymentVerifyRequest):
    import random, time
    ref_id = f"SHP-{random.randint(10000000, 99999999)}"
    release_code = f"{random.randint(100000, 999999)}"
    return {
        "status": "PAID_IN_ESCROW",
        "ref_id": ref_id,
        "release_code": release_code,
        "paid_at": time.strftime("%H:%M:%S")
    }

class PaymentVerifyRequest(BaseModel):
    order_id: str
    amount: int

@app.post("/api/verify-payment")
def verify_payment(req: PaymentVerifyRequest):
    import random, time
    ref_id = f"SHP-{random.randint(10000000, 99999999)}"
    release_code = f"{random.randint(100000, 999999)}"
    return {
        "status": "PAID_IN_ESCROW",
        "ref_id": ref_id,
        "release_code": release_code,
        "paid_at": time.strftime("%H:%M:%S")
    }

class PaymentVerifyRequest(BaseModel):
    order_id: str
    amount: int

@app.post("/api/verify-payment")
def verify_payment(req: PaymentVerifyRequest):
    import random, time
    ref_id = f"SHP-{random.randint(10000000, 99999999)}"
    release_code = f"{random.randint(100000, 999999)}"
    return {
        "status": "PAID_IN_ESCROW",
        "ref_id": ref_id,
        "release_code": release_code,
        "paid_at": time.strftime("%H:%M:%S")
    }
