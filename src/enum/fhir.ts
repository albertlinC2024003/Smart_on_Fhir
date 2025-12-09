export interface ISummary{
    fullUrl?: string;
    resource?: {
        id?: string;
        resourceType?: string;
        meta?: {
            versionId?: string;
            lastUpdated?: string;
        }
    }
}

export interface Patient {
    id?: string;
    name?: Array<{ text?: string }>;
    gender?: string;
    birthDate?: string;
}

export interface Observation {
    id?: string;
    status?: string;
    code?: {
        text?: string;
        coding?: Array<{
            system?: string;
            code?: string;
            display?: string;
        }>
    }
    subject?: {
        reference?: string;
    }
    // 其他欄位可依需求擴充
}