/**
 * Paynow Zimbabwe Payment Gateway Integration for Roadify
 * Connects Expo/React Native App over HTTPS to the hosted API / Paynow.
 */

import { customFetch } from "@roadify/api-client-react";

export interface PaynowInitiateInput {
  amount: number;
  email: string;
  phone?: string;
  method?: 'ecocash' | 'onemoney' | 'innbucks' | 'card';
  items?: { name: string; price: number }[];
  reference?: string;
}

export interface PaynowResponse {
  success: boolean;
  redirectUrl?: string;
  pollUrl?: string;
  instructions?: string;
  error?: string;
}

/**
 * Initiate a Paynow Payment via the hosted Cloud Express API
 */
export async function initiatePaynowPayment(input: PaynowInitiateInput): Promise<PaynowResponse> {
  try {
    const res = await customFetch('/api/payments/paynow/initiate', {
      method: 'POST',
      body: JSON.stringify({
        amount: input.amount,
        email: input.email,
        phone: input.phone,
        method: input.method || 'ecocash',
        reference: input.reference || `RD-PAY-${Date.now()}`,
        items: input.items || [{ name: "Roadify VIP Access", price: input.amount }],
      }),
    });

    return res as PaynowResponse;
  } catch (err: any) {
    console.error("[Paynow Integration Error]:", err);
    return {
      success: false,
      error: err.message || "Could not reach payment gateway over HTTPS.",
    };
  }
}

/**
 * Check Paynow Transaction Status via the hosted API
 */
export async function checkPaynowStatus(pollUrl: string): Promise<{ paid: boolean; status: string }> {
  try {
    const res = await customFetch('/api/payments/paynow/status', {
      method: 'POST',
      body: JSON.stringify({ pollUrl }),
    });
    return res as { paid: boolean; status: string };
  } catch (err) {
    return { paid: false, status: 'Error' };
  }
}
