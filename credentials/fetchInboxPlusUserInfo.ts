/* credentials/fetchInboxPlusUserInfo.ts
   Helper to fetch InboxPlus user info (email etc.) using the node/credential http helper.
   This file does NOT use axios or other external libs (uses context.helpers.httpRequest).
*/

import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';

export interface InboxPlusUserInfo {
	email?: string;
	full_name?: string;
	organization_id?: string;
	[key: string]: unknown;
}

/**
 * Fetch InboxPlus user info (the response returns 'body' with user data).
 * context must be either an IExecuteFunctions or ILoadOptionsFunctions instance.
 */
export async function fetchInboxPlusUserInfo(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	apiKey: string,
): Promise<InboxPlusUserInfo> {
	if (!apiKey) {
		throw new Error('API key is required for fetchInboxPlusUserInfo');
	}

	const resp = await context.helpers.httpRequest({
		method: 'POST',
		baseURL: 'https://dev-api.inboxpl.us',
		url: '/auth/get-user-info',
		headers: { api_key: apiKey },
		json: true,
	});

	// The API returns { code: 200, success: 1, body: { email: "...", ... } }
	// Normalize to return the inner body object if present
	if (resp && typeof resp === 'object' && 'body' in resp) {
		const body = (resp as Record<string, unknown>).body;
		if (body && typeof body === 'object') {
			return body as InboxPlusUserInfo;
		}
	}

	// If the API returned user object directly, return it
	if (resp && typeof resp === 'object') {
		return resp as InboxPlusUserInfo;
	}

	throw new Error('Unable to fetch user info from InboxPlus');
}
