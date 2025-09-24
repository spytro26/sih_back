interface LCAInput {
    material: string;
    process: string;
    emissions?: any;
    location?: string;
    production_volume?: number;
    energy_source?: string;
    [key: string]: any;
}
interface LCAStageResponse {
    stage: string;
    impact: {
        carbon_emission: number | string;
        water_usage: number | string;
        energy_consumption: number | string;
        waste: number | string;
        [key: string]: any;
    };
    main_cause: string;
    alternative_methods: string[];
    reduction_suggestions: string[];
    circularity_opportunities: string[];
}
declare class GeminiService {
    private genAI;
    private model;
    constructor();
    private buildLCAPrompt;
    assessLifecycle(input: LCAInput): Promise<LCAStageResponse[]>;
    private getFallbackResponse;
}
declare const _default: GeminiService;
export default _default;
//# sourceMappingURL=geminiService.d.ts.map