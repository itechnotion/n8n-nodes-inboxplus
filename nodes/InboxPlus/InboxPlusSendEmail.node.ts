import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IDataObject,
} from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

/** UUID Generator */
function generateUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/** Template interface */
interface InboxPlusTemplate {
	id?: string;
	_id?: string;
	template_name?: string;
	subject?: string;
	body?: string;
}

export class InboxPlusSendEmail implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'InboxPlus: Send Email',
		name: 'inboxPlusSendEmail',
		group: ['transform'],
		version: 1,
		subtitle: 'Send first email',
		usableAsTool: true,
		description: 'Send the first email using InboxPlus (required before starting sequences)',
		defaults: { name: 'InboxPlus Send Email' },

		icon: {
			light: 'file:logo.svg',
			dark: 'file:logo.dark.svg',
		},

		inputs: ['main'],
		outputs: ['main'],

		credentials: [
			{
				name: 'inboxPlusApi',
				required: true,
				testedBy: 'ping',
			},
		],

		properties: [
			{
				displayName: 'Sender Email',
				name: 'senderEmail',
				type: 'string',
				required: true,
				default: '',
				description: 'Email address to send from',
			},
			{
				displayName: 'Recipient Email',
				name: 'recipientEmail',
				type: 'string',
				required: true,
				default: '',
				description: 'Email address of the contact',
			},
			{
				displayName: 'Template Name or ID',
				name: 'templateId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getTemplates' },
				required: true,
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
		],
	};

	methods = {
		loadOptions: {
			async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const apiKey = (await this.getCredentials('inboxPlusApi')).apiKey as string;

				const resp = await this.helpers.httpRequest({
					method: 'POST',
					baseURL: 'https://dev-api.inboxpl.us',
					url: '/user-emails/n8n/get-email-templates',
					headers: { api_key: apiKey },
					json: true,
				});

				const list = (resp.templates as InboxPlusTemplate[]) || [];

				return list.map((t) => ({
					name: t.template_name || 'Untitled Template',
					value: t.id || t._id || '',
				}));
			},
		},
	};

	/** Credential test */
	async ping(this: IExecuteFunctions): Promise<void> {
		const apiKey = (await this.getCredentials('inboxPlusApi')).apiKey as string;

		await this.helpers.httpRequest({
			method: 'POST',
			baseURL: 'https://dev-api.inboxpl.us',
			url: '/auth/get-user-info',
			headers: { api_key: apiKey },
			json: true,
		});
	}

	/** EXECUTE */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const creds = await this.getCredentials('inboxPlusApi');
		const apiKey = creds.apiKey as string;

		const senderEmail = this.getNodeParameter('senderEmail', 0) as string;
		const recipientEmail = this.getNodeParameter('recipientEmail', 0) as string;
		const templateId = this.getNodeParameter('templateId', 0) as string;

		/** Generate InboxPlus IDs */
		const threadId = generateUUID();
		const messageId = generateUUID();

		/** Generate tracking ID */
		const trackResp = await this.helpers.httpRequest({
			method: 'POST',
			baseURL: 'https://dev-api.inboxpl.us',
			url: '/user-emails/n8n/tracking-id',
			headers: { api_key: apiKey },
			json: true,
		});

		const trackingId = trackResp.trackingId;
		const trackingImage = trackResp.trackingImage;

		/** Fetch template */
		const templateResp = await this.helpers.httpRequest({
			method: 'POST',
			baseURL: 'https://dev-api.inboxpl.us',
			url: '/user-emails/n8n/get-email-templates',
			headers: { api_key: apiKey },
			json: true,
		});

		const templates = (templateResp.templates as InboxPlusTemplate[]) || [];
		const template = templates.find((t) => [t.id, t._id, t.template_name].includes(templateId));

		if (!template) {
			throw new NodeOperationError(this.getNode(), `Template not found: ${templateId}`);
		}

		/** Build email payload */
		const payload: IDataObject = {
			recipient_email: recipientEmail,
			sender_email: senderEmail,
			subject: template.subject,
			body: template.body,
			threadId,
			message_id: messageId,
			tracking_id: trackingId,
			tracking_image: trackingImage,
		};

		/** SEND EMAIL */
		const resp = await this.helpers.httpRequest({
			method: 'POST',
			baseURL: 'https://dev-api.inboxpl.us',
			url: '/user-emails/n8n',
			headers: {
				api_key: apiKey,
				'Content-Type': 'application/json',
			},
			body: payload,
			json: true,
		});

		/** Output for StartSequence */
		return [
			[
				{
					json: {
						success: resp?.success === 1,
						apiResponse: resp,
						recipientEmail,
						senderEmail,
						templateId,
						threadId,
						messageId,
						trackingId,
						trackingImage,
						subject: template.subject,
						body: template.body,
					},
				},
			],
		];
	}
}
