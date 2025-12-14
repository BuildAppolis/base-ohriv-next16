export interface BaseDocument {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface DatabaseStats {
    documentCount: number;
    databaseSize: number;
    indexes: string[];
}
//# sourceMappingURL=index.d.ts.map