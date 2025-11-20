import type {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class InboxPlusApi implements ICredentialType {
	name = 'inboxPlusApi';
	displayName = 'InboxPlus API';
	documentationUrl = 'https://github.com/itechnotion-jay/n8n-nodes-inboxplus';

	icon = 'file:logo.svg' as const;

	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			baseURL: 'https://dev-api.inboxpl.us',
			url: '/auth/get-user-info',
			headers: {
				api_key: '={{$credentials.apiKey}}',
			},
			json: true,
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'InboxPlus API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
			typeOptions: { password: true },
		},
	];
}
