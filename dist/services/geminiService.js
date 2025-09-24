import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
class GeminiService {
    genAI;
    model;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is required");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    buildLCAPrompt(input) {
        return `
You are an expert in Lifecycle Assessment (LCA) for metallurgy and mining industries. 
Analyze the following input and provide a comprehensive lifecycle assessment.

INPUT DATA:
- Material: ${input.material}
- Process: ${input.process}
- Location: ${input.location || "Not specified"}
- Production Volume: ${input.production_volume || "Not specified"}
- Energy Source: ${input.energy_source || "Not specified"}
- Additional Data: ${JSON.stringify(input.emissions || {})}

REQUIREMENTS:
Generate a lifecycle assessment covering ALL major stages relevant to metallurgy/mining:
1. Raw Material Extraction/Mining
2. Ore Processing/Beneficiation  
3. Smelting/Refining
4. Manufacturing/Fabrication
5. Transportation/Distribution
6. Use Phase
7. End-of-Life/Disposal

For each stage, provide EXACTLY this JSON structure:
{
  "stage": "stage name",
  "impact": {
    "carbon_emission": "specific value with units or estimation method",
    "water_usage": "specific value with units or estimation method", 
    "energy_consumption": "specific value with units or estimation method",
    "waste": "specific value with units or estimation method"
  },
  "main_cause": "primary contributor to environmental impact in this stage",
  "alternative_methods": ["method1", "method2", "method3"],
  "reduction_suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "circularity_opportunities": ["opportunity1", "opportunity2", "opportunity3"]
}

IMPORTANT INSTRUCTIONS:
- Provide realistic, industry-specific data when possible
- If data is estimated or hypothetical, clearly indicate this in the values
- Include specific numerical values with appropriate units when available
- Focus on metallurgy and mining industry best practices
- Mark any suggestions as "Hypothetical:" if they may not be practical
- Consider regional variations and technology availability
- Include both current and emerging technologies in alternatives

Return ONLY a valid JSON array containing objects for each lifecycle stage. No additional text or formatting.
        `;
    }
    async assessLifecycle(input) {
        try {
            const prompt = this.buildLCAPrompt(input);
            console.log("Sending request to Gemini API...");
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log("Raw Gemini response:", text);
            // Clean and parse the response
            let cleanedText = text.trim();
            // Remove markdown code blocks if present
            if (cleanedText.startsWith("```json")) {
                cleanedText = cleanedText
                    .replace(/```json\n?/, "")
                    .replace(/\n?```$/, "");
            }
            else if (cleanedText.startsWith("```")) {
                cleanedText = cleanedText.replace(/```\n?/, "").replace(/\n?```$/, "");
            }
            try {
                const parsedResponse = JSON.parse(cleanedText);
                // Validate response structure
                if (!Array.isArray(parsedResponse)) {
                    throw new Error("Response is not an array");
                }
                // Validate each stage has required fields
                parsedResponse.forEach((stage, index) => {
                    if (!stage.stage || !stage.impact || !stage.main_cause) {
                        throw new Error(`Stage ${index} missing required fields`);
                    }
                });
                return parsedResponse;
            }
            catch (parseError) {
                console.error("JSON parsing failed:", parseError);
                console.error("Cleaned text:", cleanedText);
                // Return fallback response
                return this.getFallbackResponse(input);
            }
        }
        catch (error) {
            console.error("Gemini API error:", error);
            throw new Error(`Failed to generate LCA assessment: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    getFallbackResponse(input) {
        return [
            {
                stage: "Raw Material Extraction/Mining",
                impact: {
                    carbon_emission: "Estimated 2-5 tCO2eq per ton of material (hypothetical)",
                    water_usage: "500-2000 liters per ton (estimated)",
                    energy_consumption: "15-50 GJ per ton (estimated)",
                    waste: "5-20 tons of waste rock per ton of ore (typical range)",
                },
                main_cause: "Heavy machinery operations and ore processing require significant energy",
                alternative_methods: [
                    "Hypothetical: Advanced selective mining techniques",
                    "Renewable energy powered operations",
                    "Hypothetical: Automated extraction systems",
                ],
                reduction_suggestions: [
                    "Implement energy-efficient mining equipment",
                    "Use renewable energy sources where feasible",
                    "Optimize extraction routes and scheduling",
                ],
                circularity_opportunities: [
                    "Waste rock utilization for construction materials",
                    "Water recycling and treatment systems",
                    "Hypothetical: Mine site rehabilitation for alternative land use",
                ],
            },
            {
                stage: "Processing/Beneficiation",
                impact: {
                    carbon_emission: "1-3 tCO2eq per ton processed (estimated)",
                    water_usage: "1000-5000 liters per ton (typical range)",
                    energy_consumption: "10-30 GJ per ton (estimated)",
                    waste: "20-80% of input material as tailings (industry typical)",
                },
                main_cause: "Energy-intensive crushing, grinding, and separation processes",
                alternative_methods: [
                    "Sensor-based ore sorting technologies",
                    "Hypothetical: Bio-processing methods",
                    "Advanced flotation techniques",
                ],
                reduction_suggestions: [
                    "Optimize particle size distribution",
                    "Implement process automation and control",
                    "Use more efficient separation technologies",
                ],
                circularity_opportunities: [
                    "Tailings reprocessing for additional metal recovery",
                    "Process water recycling systems",
                    "Tailings utilization in construction materials",
                ],
            },
        ];
    }
}
export default new GeminiService();
//# sourceMappingURL=geminiService.js.map