/* credentials/fetchInboxPlusUserInfo.ts
   Helper to fetch InboxPlus user info (email etc.) using the node/credential http helper.
   This file uses httpRequestWithAuthentication for proper credential handling.
*/

import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';

export interface InboxPlusUserInfo {
	email?: string;
	full_name?: string;
	organization_id?: string;
	[key: string]: unknown;
}

/**
 * Fetch InboxPlus user info using the node/credential http helper.
 * context must be either an IExecuteFunctions or ILoadOptionsFunctions instance.
 */
export async function fetchInboxPlusUserInfo(
	context: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<InboxPlusUserInfo> {
	// Use the httpRequestWithAuthentication helper so the API key from the credential is used
	const resp = await context.helpers.httpRequestWithAuthentication.call(context, 'inboxPlusApi', {
		method: 'POST',
		baseURL: 'https://api.inboxpl.us',
		url: '/auth/get-user-info',
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
