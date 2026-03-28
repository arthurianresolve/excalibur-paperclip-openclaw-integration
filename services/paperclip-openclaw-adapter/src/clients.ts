import axios, { AxiosRequestConfig } from "axios";
import { config } from "./config";
import { redactAuth } from "./lib/redact";

export interface GatewayRequest {
  method?: "get" | "post";
  path: string;
  data?: unknown;
  headers?: Record<string, string | undefined>;
}

export async function callOpenClaw({
  method = "post",
  path,
  data,
  headers,
}: GatewayRequest): Promise<unknown> {
  const url = `${config.openClaw.baseUrl}${config.openClaw.actionPath}${path}`;
  const requestConfig: AxiosRequestConfig = {
    method,
    url,
    headers: {
      Authorization: `Bearer ${config.openClaw.token}`,
      "Content-Type": "application/json",
      ...headers,
    },
    data,
  };
  try {
    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const redacted = redactAuth(requestConfig.headers?.Authorization);
      throw new Error(
        `OpenClaw request failed ${requestConfig.method?.toUpperCase()} ${requestConfig.url} token=${redacted} reason=${error.message}`,
      );
    }
    throw error;
  }
}
