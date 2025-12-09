import type {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
	IAuthenticateGeneric,
} from 'n8n-workflow';

export class InboxPlusApi implements ICredentialType {
	name = 'inboxPlusApi';
	displayName = 'InboxPlus API';
	documentationUrl = 'https://github.com/itechnotion/n8n-nodes-inboxplus';

	icon = 'file:logo.svg' as const;

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
				api_key: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			baseURL: 'https://api.inboxpl.us',
			url: '/user-emails/n8n/get-email-templates',
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
			typeOptions: {
				password: true,
			},
			description: 'Your InboxPlus API Key',
		},
	];
}
