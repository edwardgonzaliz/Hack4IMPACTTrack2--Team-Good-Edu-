from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🌍 GLOBAL BIN DATA (MANUAL CONTROL)
global_bins = [
    {"id": "bin1", "lat": 20.2961, "lng": 85.8245, "level": 30},
    {"id": "bin2", "lat": 20.2975, "lng": 85.8255, "level": 50},
    {"id": "bin3", "lat": 20.2950, "lng": 85.8230, "level": 70},
    {"id": "bin4", "lat": 20.2980, "lng": 85.8265, "level": 20},
]

# 🧠 Status logic
def update_status(bin):
    if bin["level"] < 40:
        return "Empty"
    elif bin["level"] < 80:
        return "Half"
    else:
        return "Full"


# 📦 API: Get all bins
@app.get("/bins")
def get_bins():
    for b in global_bins:
        b["status"] = update_status(b)
    return global_bins


# 📊 API: Stats
@app.get("/stats")
def get_stats():
    return {
        "total": len(global_bins),
        "full": len([b for b in global_bins if b["level"] > 80]),
        "half": len([b for b in global_bins if 40 < b["level"] <= 80]),
        "empty": len([b for b in global_bins if b["level"] <= 40]),
    }


# 🔔 API: Alerts
@app.get("/alerts")
def get_alerts():
    alerts = []

    for b in global_bins:
        if b["level"] > 80:
            alerts.append(f"🚨 {b['id']} is FULL")
        elif b["level"] > 60:
            alerts.append(f"⚠️ {b['id']} nearing capacity")

    return alerts


# 🚛 API: Full bins (for routing)
@app.get("/full_bins")
def get_full_bins():
    return [b for b in global_bins if b["level"] > 80]


# 🎛️ API: Update bin level (IoT simulation)
@app.post("/update_bin/{bin_id}")
def update_bin(bin_id: str, level: int):
    for b in global_bins:
        if b["id"] == bin_id:
            b["level"] = level
            b["status"] = update_status(b)
            return {"message": "Updated successfully", "bin": b}

    return {"error": "Bin not found"}


# 🏠 Root
@app.get("/")
def home():
    return {"message": "Smart Waste Management API Running 🚀"}