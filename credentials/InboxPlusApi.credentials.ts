import type {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
	IAuthenticateGeneric,
} from 'n8n-workflow';

export class InboxPlusApi implements ICredentialType {
	name = 'inboxPlusApi';
	displayName = 'InboxPlus API';
	documentationUrl = 'https://app.inboxpl.us/account/';

	icon = 'file:../nodes/InboxPlus/logo.svg' as const;

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
			description: 'To get your InboxPlus account API key please <a href="https://app.inboxpl.us/account/" target="_blank">click here to create your account</a>',
		},
	];
}
