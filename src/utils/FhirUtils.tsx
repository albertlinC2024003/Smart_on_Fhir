import {ISummary} from "../enum/fhir.ts";

export function parseBundleToSummaryArray(jsonStr: string): ISummary[] {
    try {
        const obj = JSON.parse(jsonStr);
        if (!Array.isArray(obj.entry)) return [];
        return obj.entry.map((item: any) => ({
            fullUrl: item.fullUrl,
            resource: {
                id: item.resource?.id,
                resourceType: item.resource?.resourceType,
                meta: {
                    versionId: item.resource?.meta?.versionId,
                    lastUpdated: item.resource?.meta?.lastUpdated,
                }
            }
        }));
    } catch {
        return [];
    }
}