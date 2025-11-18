import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class InboxPlusApi implements ICredentialType {
	name = 'inboxPlusApi';
	displayName = 'InboxPlus API';
	documentationUrl = 'https://docs.n8n.io/credentials/inboxplus/';

	icon = {
		light: 'file:logo.svg',
		dark: 'file:logo.svg',
	};

	// Required by n8n cloud ESLint
	test = {
		request: {
			method: 'GET' as const,
			url: 'https://api.inboxpl.us/ping',
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];
}
