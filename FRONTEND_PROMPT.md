# React Frontend Development Prompt

Create a React frontend application for an AI-driven Lifecycle Assessment (LCA) tool for metallurgy and mining industries. The app should communicate with the backend API running at `http://localhost:5000`.

## Backend API Details:

### Main Endpoint: POST `/api/lca/assess`
- **Purpose**: Generate AI-powered lifecycle assessment
- **Required**: `material` (string), `process` (string)  
- **Optional**: `location`, `production_volume`, `energy_source`, `emissions` object
- **Response**: Array of lifecycle stage objects with `stage`, `impact`, `main_cause`, `alternative_methods`, `reduction_suggestions`, `circularity_opportunities`
- **Processing Time**: 8-15 seconds (show loading state)

### Helper Endpoints:
- GET `/api/lca/supported-materials` - Returns materials/processes arrays for dropdowns
- GET `/health` - Server health check
- GET `/api/lca/health` - LCA service health check

### Rate Limiting: 10 requests per 15 minutes per IP

## Frontend Requirements:

### 1. Input Form:
- Material input (required, dropdown with suggestions from `/api/lca/supported-materials`)
- Process input (required, dropdown with suggestions)  
- Location input (optional text)
- Production volume (optional number)
- Energy source (optional text)
- Additional emissions data (optional object/form fields)

### 2. Results Display:
- Show all lifecycle stages in cards/sections
- For each stage display:
  - Stage name as header
  - Impact metrics (carbon, water, energy, waste) in a structured layout
  - Main cause explanation
  - Alternative methods as bulleted list
  - Reduction suggestions as bulleted list
  - Circularity opportunities as bulleted list
- Show processing time and request ID
- Display disclaimer prominently: "This assessment includes both verified data and hypothetical suggestions. Please validate recommendations with industry experts before implementation."

### 3. UX Features:
- Loading spinner/progress indicator during API calls (8-15 sec)
- Error handling with user-friendly messages
- Form validation (material & process required)
- Retry mechanism for failed requests
- Responsive design for desktop/mobile
- Clear visual hierarchy for results

### 4. Technical Setup:
- Use Vite React app on `http://localhost:5173` (CORS already configured)
- Use modern hooks (useState, useEffect)
- Implement proper error boundaries
- Add TypeScript if preferred

### 5. Styling Suggestions:
- Modern, clean interface suitable for industrial/professional use
- Use cards/sections for lifecycle stages
- Color coding for different impact types
- Icons for different stages if possible
- Professional color scheme (blues, greens, grays)

### 6. Sample API Call:
```javascript
const response = await fetch('http://localhost:5000/api/lca/assess', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    material: "Copper ore",
    process: "Open-pit mining",
    location: "Chile",
    production_volume: 1000,
    energy_source: "Mixed grid"
  })
});
const data = await response.json();
```

The backend is fully functional and returns structured AI-generated assessments. Focus on creating an intuitive user interface that makes the complex LCA data easily understandable for mining industry professionals.