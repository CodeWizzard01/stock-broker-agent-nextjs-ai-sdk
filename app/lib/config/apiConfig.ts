export const stockApiConfig = {
  baseUrl: "https://financialmodelingprep.com/api/v3",

  getApiKey: (): string => {
    const apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
    if (!apiKey) {
      throw new Error(
        "FINANCIAL_MODELING_PREP_API_KEY is not defined in environment variables"
      );
    }
    return apiKey;
  },

  buildUrl: (endpoint: string): string => {
    return `${stockApiConfig.baseUrl}${
      endpoint.startsWith("/") ? endpoint : "/" + endpoint
    }?apikey=${stockApiConfig.getApiKey()}`;
  },
};