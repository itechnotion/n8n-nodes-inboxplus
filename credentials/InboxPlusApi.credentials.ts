import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class InboxPlusApi implements ICredentialType {
	name = 'inboxPlusApi';
	displayName = 'InboxPlus API';
	documentationUrl = 'https://api.inboxpl.us/';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'InboxPlus API key (use the test key provided by the InboxPlus team)',
		},
		{
			displayName: 'Header Name',
			name: 'headerName',
			type: 'string',
			default: 'Authorization',
			description:
				'Header name used to send the API key (e.g. Authorization or x-api-key). Use "Authorization" with value "Bearer <key>"',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.inboxpl.us/',
			description: 'Base URL of the InboxPlus API',
		},
	];
}
