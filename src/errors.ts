export class RealApiError extends Error { constructor(public readonly status: number, public readonly body: string) { super(`REAL API returned ${status}`); this.name = "RealApiError"; } }
