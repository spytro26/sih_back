# LCA Backend API Documentation

## Base URL

```
http://localhost:5000
```

## Headers Required

```json
{
  "Content-Type": "application/json"
}
```

## CORS Configuration

- Frontend URL allowed: `http://localhost:5173`
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Credentials: Supported

---

## 🔥 Main LCA Assessment Endpoint

### POST `/api/lca/assess`

**Purpose**: Generate AI-powered Lifecycle Assessment for metallurgy/mining materials

#### Request Body (JSON):

```json
{
  "material": "string (required)", // e.g., "Copper ore", "Iron ore"
  "process": "string (required)", // e.g., "Open-pit mining", "Smelting"
  "location": "string (optional)", // e.g., "Chile", "Australia"
  "production_volume": "number (optional)", // e.g., 1000
  "energy_source": "string (optional)", // e.g., "Mixed grid", "Solar"
  "emissions": "object (optional)" // Any additional emission data
}
```

#### Example Request:

```javascript
const response = await fetch("http://localhost:5000/api/lca/assess", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    material: "Copper ore",
    process: "Open-pit mining",
    location: "Chile",
    production_volume: 1000,
    energy_source: "Mixed grid",
    emissions: {
      current_co2: "500 tCO2eq",
      water_usage: "1500 m3",
    },
  }),
});
```

#### Response (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "stage": "Raw Material Extraction/Mining",
      "impact": {
        "carbon_emission": "150 tCO2eq (estimated)",
        "water_usage": "500 m3 (estimated)",
        "energy_consumption": "50 MWh (estimated)",
        "waste": "2000 tonnes (estimated)"
      },
      "main_cause": "Energy consumption for blasting, hauling, and equipment operation",
      "alternative_methods": [
        "Improved blasting techniques",
        "Electric or hybrid mining vehicles",
        "Automated mining systems"
      ],
      "reduction_suggestions": [
        "Optimize haul routes to reduce fuel consumption",
        "Implement water recycling systems",
        "Utilize renewable energy sources"
      ],
      "circularity_opportunities": [
        "Waste rock characterization for potential resource recovery",
        "Tailings management for metal recovery"
      ]
    }
    // ... more stages (typically 5-7 stages total)
  ],
  "metadata": {
    "request_id": "lca_1758425327992",
    "processing_time_ms": 10118,
    "stages_analyzed": 7,
    "timestamp": "2025-09-21T03:28:47.992Z",
    "disclaimer": "This assessment includes both verified data and hypothetical suggestions. Please validate recommendations with industry experts before implementation."
  }
}
```

#### Error Responses:

```json
// 400 - Validation Error
{
  "error": "Validation Error",
  "message": "Material is required and must be a non-empty string"
}

// 429 - Rate Limit
{
  "error": "Rate Limit Exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 900
}

// 500 - Server Error
{
  "success": false,
  "error": "Assessment Failed",
  "message": "Failed to generate LCA assessment: API error",
  "timestamp": "2025-09-21T03:28:47.992Z"
}

// 503 - AI Service Unavailable
{
  "success": false,
  "error": "AI Service Unavailable",
  "message": "The AI assessment service is temporarily unavailable. Please try again later."
}
```

---

## 🏥 Health Check Endpoints

### GET `/health`

**Purpose**: Check if the main server is running

#### Response (200 OK):

```json
{
  "status": "OK",
  "message": "LCA Backend Server is running",
  "timestamp": "2025-09-21T03:28:47.992Z"
}
```

### GET `/api/lca/health`

**Purpose**: Check LCA service health and features

#### Response (200 OK):

```json
{
  "status": "healthy",
  "service": "LCA Assessment API",
  "version": "1.0.0",
  "features": [
    "Lifecycle Assessment Analysis",
    "AI-powered Impact Assessment",
    "Circularity Opportunities",
    "Alternative Methods Suggestions",
    "Reduction Recommendations"
  ],
  "timestamp": "2025-09-21T03:28:47.992Z"
}
```

---

## 📋 Reference Data Endpoint

### GET `/api/lca/supported-materials`

**Purpose**: Get list of supported materials and processes for UI dropdowns/suggestions

#### Response (200 OK):

```json
{
  "materials": [
    "Iron ore",
    "Copper ore",
    "Aluminum ore (Bauxite)",
    "Gold ore",
    "Silver ore",
    "Zinc ore",
    "Lead ore",
    "Nickel ore",
    "Platinum group metals",
    "Rare earth elements",
    "Coal",
    "Limestone",
    "Sand and gravel",
    "Steel",
    "Aluminum",
    "Copper"
  ],
  "processes": [
    "Open-pit mining",
    "Underground mining",
    "Strip mining",
    "Placer mining",
    "Smelting",
    "Refining",
    "Electrowinning",
    "Flotation",
    "Magnetic separation",
    "Gravity separation",
    "Leaching",
    "Roasting",
    "Sintering",
    "Pelletizing"
  ],
  "note": "The AI system can analyze any material or process. This list shows common examples.",
  "timestamp": "2025-09-21T03:28:47.992Z"
}
```

---

## 🚫 Error Handling

### 404 - Route Not Found

```json
{
  "error": "Route not found",
  "message": "The requested route /invalid/route does not exist"
}
```

---

## 🔧 Rate Limiting

- **Limit**: 10 requests per 15 minutes per IP
- **Window**: 15 minutes (900 seconds)
- **Response**: 429 status with retry-after information

---

## 📊 Lifecycle Stages Returned

The AI typically returns 5-7 lifecycle stages:

1. **Raw Material Extraction/Mining**
2. **Ore Processing/Beneficiation**
3. **Smelting/Refining**
4. **Manufacturing/Fabrication**
5. **Transportation/Distribution**
6. **Use Phase**
7. **End-of-Life/Disposal**

Each stage includes:

- **stage**: Stage name
- **impact**: Carbon, water, energy, waste metrics
- **main_cause**: Primary environmental impact driver
- **alternative_methods**: 3+ alternative approaches
- **reduction_suggestions**: 3+ actionable improvements
- **circularity_opportunities**: 3+ recycling/reuse options

---

## 🎯 Frontend Integration Tips

### 1. Loading States

```javascript
const [loading, setLoading] = useState(false);
const [assessmentData, setAssessmentData] = useState(null);
const [error, setError] = useState(null);
```

### 2. Error Handling

```javascript
try {
  const response = await fetch("/api/lca/assess", options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Assessment failed");
  }

  setAssessmentData(data);
} catch (err) {
  setError(err.message);
}
```

### 3. Typical Processing Time

- **Average**: 8-15 seconds
- **Show progress indicator**: Recommended
- **Timeout**: Set to 30 seconds minimum

### 4. Form Validation

- **material**: Required, min 2 characters
- **process**: Required, min 2 characters
- **production_volume**: Optional, positive number
- **location**: Optional, any string
- **energy_source**: Optional, any string

### 5. UI Suggestions

- Use the `/api/lca/supported-materials` endpoint to populate dropdowns
- Show disclaimer from metadata prominently
- Display processing time and request ID for user reference
- Implement retry mechanism for failed requests
- Show detailed error messages from API responses

---

## 🔑 Environment Setup

Make sure your React app runs on `http://localhost:5173` (default Vite port) or update the CORS settings in the backend.
