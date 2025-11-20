import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

interface InboxPlusTemplate {
	id?: string;
	_id?: string;
	template_name?: string;
	subject?: string;
	body?: string;
}

export class InboxPlusPrepareEmail implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'InboxPlus: Prepare Email',
		name: 'inboxPlusPrepareEmail',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		subtitle: 'Prepare template + tracking',
		description: 'Loads InboxPlus template and generates tracking ID & HTML body',
		defaults: { name: 'InboxPlus Prepare Email' },
		icon: { light: 'file:logo.svg', dark: 'file:logo.dark.svg' },
		inputs: ['main'],
		outputs: ['main'],

		credentials: [
			{
				name: 'inboxPlusApi',
				required: true,
			},
		],

		properties: [
			{
				displayName: 'Recipient Email',
				name: 'recipientEmail',
				type: 'string',
				required: true,
				default: '',
			},
			{
				displayName: 'Template Name or ID',
				name: 'templateId',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				required: true,
				typeOptions: { loadOptionsMethod: 'getTemplates' },
				default: '',
			},
		],
	};

	methods = {
		loadOptions: {
			async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const creds = await this.getCredentials('inboxPlusApi');
				const apiKey = creds.apiKey as string;

				const resp = await this.helpers.httpRequest({
					method: 'POST',
					baseURL: 'https://dev-api.inboxpl.us',
					url: '/user-emails/n8n/get-email-templates',
					headers: { api_key: apiKey },
					json: true,
				});

				const list = (resp.templates as InboxPlusTemplate[]) || [];

				return list.map((t) => ({
					name: t.template_name || 'Template',
					value: t.id || t._id || '',
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const creds = await this.getCredentials('inboxPlusApi');
		const apiKey = creds.apiKey as string;

		const recipientEmail = this.getNodeParameter('recipientEmail', 0) as string;
		const templateId = this.getNodeParameter('templateId', 0) as string;

		// tracking
		const track = await this.helpers.httpRequest({
			method: 'POST',
			url: 'https://dev-api.inboxpl.us/user-emails/n8n/tracking-id',
			headers: { api_key: apiKey },
			json: true,
		});

		const trackingId = track.trackingId;
		const trackingImage = track.trackingImage;

		// template
		const tResp = await this.helpers.httpRequest({
			method: 'POST',
			url: 'https://dev-api.inboxpl.us/user-emails/n8n/get-email-templates',
			headers: { api_key: apiKey },
			json: true,
		});

		const templates = tResp.templates as InboxPlusTemplate[];
		const template = templates.find((t) => t.id === templateId || t._id === templateId);

		const gmailBodyHtml = `${template?.body || ''}<br>${trackingImage}`;

		return [
			[
				{
					json: {
						success: true,
						recipientEmail,
						templateId,
						subject: template?.subject,
						body: template?.body,
						gmailBodyHtml,
						trackingId,
						trackingImage,
					},
				},
			],
		];
	}
}
