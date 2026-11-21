import { Injectable, Optional } from '@nestjs/common';

/**
 * Configuration options for initializing the Flutterwave service.
 */
export interface FlutterwaveConfig {
  /** Flutterwave v3 Secret Key (e.g. FLWSECK_TEST-... or FLWSECK-...) */
  secretKey?: string;
  /** Flutterwave v3 API Base URL (defaults to https://api.flutterwave.com/v3) */
  baseUrl?: string;
  /** Request timeout in milliseconds (defaults to 10000ms) */
  timeoutMs?: number;
}

/**
 * Standard envelope response returned by Flutterwave v3 APIs.
 */
export interface FlwApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Custom error thrown when Flutterwave API request fails or returns an error status.
 */
export class FlutterwaveApiError extends Error {
  /**
   * @param message Human-readable error message.
   * @param statusCode HTTP status code returned by the provider or 500 for network failure.
   * @param payload Raw response payload returned by Flutterwave.
   */
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'FlutterwaveApiError';
  }
}

/**
 * Payload contract for creating a hosted checkout payment session.
 */
export interface CreatePaymentSessionPayload {
  tx_ref: string;
  amount: string | number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    name: string;
    phonenumber?: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  meta?: Record<string, unknown>;
  payment_plan?: string | number;
}

/**
 * Verified transaction details returned by Flutterwave.
 */
export interface FlwVerifiedTransaction {
  id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  charged_amount?: number;
  status: string;
  payment_type?: string;
  customer?: {
    id?: number;
    name?: string;
    email?: string;
  };
  card?: {
    first_6digits?: string;
    last_4digits?: string;
    issuer?: string;
    token?: string;
    type?: string;
    expiry?: string;
  };
}

/**
 * @description NestJS service encapsulating direct server-to-server HTTP integration with Flutterwave v3.
 * Handles checkout initialization, zero-trust transaction verification, and secure API communication.
 */
@Injectable()
export class FlutterwaveService {
  private readonly secretKey: string | undefined;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  /**
   * @description Initializes the Flutterwave service with optional configuration overrides or environment variables.
   * @param config Optional explicit configuration object.
   */
  constructor(@Optional() config?: FlutterwaveConfig) {
    this.secretKey = config?.secretKey ?? process.env.FLW_SECRET_KEY;
    this.baseUrl =
      config?.baseUrl ??
      process.env.FLW_V3_BASE_URL ??
      'https://api.flutterwave.com/v3';
    this.timeoutMs = config?.timeoutMs ?? 10000;
  }

  /**
   * @description Executes an authenticated HTTP request against Flutterwave v3 API.
   * @param path Target API path (e.g. '/payments' or '/transactions/123/verify').
   * @param options Fetch RequestInit options.
   * @returns Typed Flutterwave API response envelope.
   * @throws {Error} When FLW_SECRET_KEY is missing.
   * @throws {FlutterwaveApiError} When Flutterwave returns HTTP error status or { status: 'error' }.
   * @example
   * ```ts
   * const response = await flwService.request<{ link: string }>('/payments', { method: 'POST', body: ... });
   * ```
   */
  async request<T = unknown>(
    path: string,
    options: RequestInit = {},
  ): Promise<FlwApiResponse<T>> {
    if (!this.secretKey) {
      throw new Error('Missing FLW_SECRET_KEY for Flutterwave request');
    }

    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.secretKey}`,
      ...(options.headers as Record<string, string>),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      const body = (await response.json()) as FlwApiResponse<T>;

      if (!response.ok || body.status === 'error') {
        throw new FlutterwaveApiError(
          body.message ||
            `Flutterwave request failed with status ${response.status}`,
          response.status,
          body,
        );
      }

      return body;
    } catch (error) {
      if (error instanceof FlutterwaveApiError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FlutterwaveApiError(
          `Flutterwave request timed out after ${this.timeoutMs}ms`,
          504,
        );
      }
      throw new FlutterwaveApiError(
        error instanceof Error
          ? error.message
          : 'Unknown Flutterwave network error',
        500,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * @description Initiates a Flutterwave Hosted Checkout payment session.
   * @param payload Parameters including tx_ref, amount, currency, customer, and redirect URL.
   * @returns Object containing the hosted payment URL.
   * @throws {FlutterwaveApiError} On API validation failure or network issues.
   * @example
   * ```ts
   * const session = await flwService.createPaymentSession({ tx_ref: 'SUB-123', amount: 15000, ... });
   * console.log(session.link);
   * ```
   */
  async createPaymentSession(
    payload: CreatePaymentSessionPayload,
  ): Promise<{ link: string }> {
    const response = await this.request<{ link: string }>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.data;
  }

  /**
   * @description Performs mandatory server-side verification of a completed payment using Flutterwave's transaction ID.
   * @param transactionId Flutterwave numeric or string transaction ID returned in webhook or redirect callback.
   * @returns Detailed verified transaction record containing amount, currency, status, and tokenized card info.
   * @throws {FlutterwaveApiError} When transaction lookup fails or returns error.
   * @example
   * ```ts
   * const tx = await flwService.verifyTransaction('123456');
   * if (tx.status === 'successful') { ... }
   * ```
   */
  async verifyTransaction(
    transactionId: string | number,
  ): Promise<FlwVerifiedTransaction> {
    const response = await this.request<FlwVerifiedTransaction>(
      `/transactions/${transactionId}/verify`,
      { method: 'GET' },
    );

    return response.data;
  }
}
