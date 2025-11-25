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

/** Template interface */
interface InboxPlusTemplate {
	id?: string;
	_id?: string;
	template_name?: string;
	subject?: string;
	body?: string;
}

/** Sequence interface */
interface InboxPlusSequence {
	id?: string;
	_id?: string;
	sequence_name?: string;
}

export class InboxPlus implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'InboxPlus',
		name: 'inboxPlus',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with InboxPlus API - send emails and manage sequences',
		defaults: { name: 'InboxPlus' },
		usableAsTool: true,

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
			},
		],

		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Prepare Email',
						value: 'prepareEmail',
						description: 'Load template and generate tracking for Gmail',
						action: 'Prepare an email',
					},
					{
						name: 'Start Sequence',
						value: 'startSequence',
						description: 'Record sent email and start automated follow-up sequence',
						action: 'Start a sequence',
					},
				],
				default: 'prepareEmail',
			},

			// ========== PREPARE EMAIL FIELDS ==========
			{
				displayName: 'Recipient Email',
				name: 'recipientEmail',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['prepareEmail'],
					},
				},
				required: true,
				default: '',
				placeholder: 'contact@example.com',
				description: 'Email address of the recipient',
			},
			{
				displayName: 'Template Name or ID',
				name: 'templateId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getTemplates' },
				displayOptions: {
					show: {
						operation: ['prepareEmail'],
					},
				},
				required: true,
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},

			// ========== START SEQUENCE FIELDS ==========
			{
				displayName: 'Sender Email',
				name: 'sequenceSenderEmail',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['startSequence'],
					},
				},
				required: true,
				default: '',
				placeholder: 'you@example.com',
				description: 'Your email address (sender)',
			},
			{
				displayName: 'Recipient Email',
				name: 'sequenceRecipientEmail',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['startSequence'],
					},
				},
				required: true,
				default: '',
				placeholder: 'contact@example.com',
				description: 'Recipient email address',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['startSequence'],
					},
				},
				required: true,
				default: '',
				placeholder: 'Email Subject',
				description: 'Email subject from Prepare Email node',
			},
			{
				displayName: 'Thread ID',
				name: 'threadId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['startSequence'],
					},
				},
				required: true,
				default: '',
				placeholder: 'thread-ID',
				description: 'Gmail thread ID from Gmail node',
			},
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['startSequence'],
					},
				},
				required: true,
				default: '',
				placeholder: 'message-ID',
				description: 'Gmail message ID from Gmail node',
			},
			{
				displayName: 'Tracking ID',
				name: 'trackingId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['startSequence'],
					},
				},
				required: true,
				default: '',
				placeholder: 'tracking-ID',
				description: 'Tracking ID from Prepare Email node',
			},
			{
				displayName: 'Sequence Name or ID',
				name: 'sequenceId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getSequences' },
				displayOptions: {
					show: {
						operation: ['startSequence'],
					},
				},
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

			async getSequences(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const apiKey = (await this.getCredentials('inboxPlusApi')).apiKey as string;

				const resp = await this.helpers.httpRequest({
					method: 'POST',
					baseURL: 'https://dev-api.inboxpl.us',
					url: '/user-emails/n8n/get-sequences',
					headers: { api_key: apiKey },
					json: true,
				});

				const list = (resp.sequences as InboxPlusSequence[]) || [];

				// Note: n8n API doesn't return is_first_mail, so we store just id and name
				// We'll fetch full details in execute() when needed
				return list.map((s) => ({
					name: s.sequence_name || 'Untitled Sequence',
					value: s.id || s._id || '',
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const operation = this.getNodeParameter('operation', 0) as string;
		const creds = await this.getCredentials('inboxPlusApi');
		const apiKey = creds.apiKey as string;

		// ========== PREPARE EMAIL OPERATION ==========
		if (operation === 'prepareEmail') {
			const recipientEmail = this.getNodeParameter('recipientEmail', 0) as string;
			const templateId = this.getNodeParameter('templateId', 0) as string;

			// Generate tracking ID
			const trackResp = await this.helpers.httpRequest({
				method: 'POST',
				baseURL: 'https://dev-api.inboxpl.us',
				url: '/user-emails/n8n/tracking-id',
				headers: { api_key: apiKey },
				json: true,
			});

			const trackingId = trackResp.trackingId;
			const trackingImage = trackResp.trackingImage;

			// Fetch template
			const templateResp = await this.helpers.httpRequest({
				method: 'POST',
				baseURL: 'https://dev-api.inboxpl.us',
				url: '/user-emails/n8n/get-email-templates',
				headers: { api_key: apiKey },
				json: true,
			});

			const templates = (templateResp.templates as InboxPlusTemplate[]) || [];
			const template = templates.find((t) => [t.id, t._id].includes(templateId));

			if (!template) {
				throw new NodeOperationError(this.getNode(), `Template not found: ${templateId}`);
			}

			// Prepare body with tracking image for Gmail
			const gmailBodyHtml = `${template.body}<br>${trackingImage}`;

			return [
				[
					{
						json: {
							success: true,
							operation: 'prepareEmail',
							recipientEmail,
							templateId,
							trackingId,
							trackingImage,
							subject: template.subject,
							body: template.body,
							gmailBodyHtml,
						},
					},
				],
			];
		}

		// ========== START SEQUENCE OPERATION ==========
		if (operation === 'startSequence') {
			const senderEmail = (this.getNodeParameter('sequenceSenderEmail', 0) as string).trim();
			const recipientEmail = (this.getNodeParameter('sequenceRecipientEmail', 0) as string).trim();
			const subject = (this.getNodeParameter('subject', 0) as string).trim();
			const threadId = (this.getNodeParameter('threadId', 0) as string).trim();
			const messageId = (this.getNodeParameter('messageId', 0) as string).trim();
			const trackingId = (this.getNodeParameter('trackingId', 0) as string).trim();
			const sequenceId = this.getNodeParameter('sequenceId', 0) as string;

			// Validate required fields
			if (!senderEmail || !recipientEmail || !subject || !threadId || !messageId || !trackingId || !sequenceId) {
				throw new NodeOperationError(
					this.getNode(),
					'All fields are required. Make sure Prepare Email and Gmail nodes are connected.',
				);
			}

			// Build payload
			const payload: IDataObject = {
				recipient_email: recipientEmail,
				sender_email: senderEmail,
				subject,
				threadId,
				message_id: messageId,
				tracking_id: trackingId,
				sequenceId,
			};

			// Call API to start sequence
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

			return [
				[
					{
						json: {
							success: resp?.success === 1,
							operation: 'startSequence',
							sequenceId,
							recipientEmail,
							senderEmail,
							subject,
							threadId,
							messageId,
							trackingId,
							apiResponse: resp,
						},
					},
				],
			];
		}

		throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
