import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

/** ------------------ UUID Generator ------------------ */
function generateUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/** Escape HTML so backend JSON parser will not fail */
function escapeHtmlForJson(input: string): string {
	return input
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\"')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r');
}

interface InboxPlusTemplate {
	id?: string;
	_id?: string;
	template_name?: string;
	subject?: string;
	body?: string;
}

interface InboxPlusSequence {
	id?: string;
	_id?: string;
	sequence_name?: string;
}

interface InboxPlusUser {
	email: string;
	full_name: string;
}


/** ------------------ NODE DEFINITION ------------------ */
export class InboxPlus implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'InboxPlus',
		name: 'inboxPlus',
		group: ['transform'],
		version: 1,
		icon: {
			light: 'file:logo.svg',
			dark: 'file:logo.dark.svg',
		},
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send first template email and auto start sequence using InboxPlus',
		defaults: {
			name: 'InboxPlus',
		},
		usableAsTool: true,
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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'startWorkflow',
				noDataExpression: true,
				options: [
					{
						name: 'Start InboxPlus Workflow',
						value: 'startWorkflow',
						action: 'Send first template email and auto start sequence',
						description: 'Loads selected template, sends first email, and starts sequence',
					},
				],
			},

			{
				displayName: 'Recipient Email',
				name: 'recipientEmail',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { operation: ['startWorkflow'] } },
				description: 'Email address of the contact',
			},

			{
				displayName: 'Template Name or ID',
				name: 'templateId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getTemplates' },
				displayOptions: { show: { operation: ['startWorkflow'] } },
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},

			{
				displayName: 'Sequence Name or ID',
				name: 'sequenceId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getSequences' },
				displayOptions: { show: { operation: ['startWorkflow'] } },
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
		],
	};

	/** ------------------ loadOptions ------------------ */
	methods = {
		loadOptions: {
			// Load templates
			async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const creds = await this.getCredentials('inboxPlusApi');
				const apiKey = (creds?.apiKey as string) ?? '';
				if (!apiKey) return [];

				const resp = await this.helpers.httpRequest({
					method: 'POST',
					baseURL: 'https://dev-api.inboxpl.us',
					url: '/user-emails/n8n/get-email-templates',
					headers: { api_key: apiKey },
					json: true,
				});

				const list = (resp?.templates || []) as InboxPlusTemplate[];

				return list.map((t) => ({
					name: t.template_name || t.subject || 'Untitled Template',
					value: t.id || t._id || '',
				}));
			},

			// Load sequences
			async getSequences(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const creds = await this.getCredentials('inboxPlusApi');
				const apiKey = (creds?.apiKey as string) ?? '';
				if (!apiKey) return [];

				const resp = await this.helpers.httpRequest({
					method: 'POST',
					baseURL: 'https://dev-api.inboxpl.us',
					url: '/user-emails/n8n/get-sequences',
					headers: { api_key: apiKey },
					json: true,
				});

				return (resp?.sequences || []).map((s: InboxPlusSequence) => ({
					name: s.sequence_name || 'Untitled Sequence',
					value: s.id || s._id || '',
				}));
			},
		},
	};

	/** ------------------ Credential test ------------------ */
	async ping(this: IExecuteFunctions): Promise<void> {
		const creds = await this.getCredentials('inboxPlusApi');
		const apiKey = (creds?.apiKey as string) ?? '';

		if (!apiKey) throw new NodeOperationError(this.getNode(), 'API Key missing');

		try {
			await this.helpers.httpRequest({
				method: 'POST',
				baseURL: 'https://dev-api.inboxpl.us',
				url: '/user-emails/n8n/get-email-templates',
				headers: { api_key: apiKey },
				json: true,
			});
		} catch {
			throw new NodeOperationError(this.getNode(), 'Invalid API Key');
		}
	}

	/** ------------------ EXECUTE MAIN LOGIC ------------------ */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const creds = await this.getCredentials('inboxPlusApi');
		const apiKey = (creds?.apiKey as string) ?? '';
		if (!apiKey) throw new NodeOperationError(this.getNode(), 'API Key missing');

		const operation = this.getNodeParameter('operation', 0) as string;
		if (operation !== 'startWorkflow')
			throw new NodeOperationError(this.getNode(), 'Operation not implemented');

		/** 1. Read input */
		const recipientEmail = this.getNodeParameter('recipientEmail', 0) as string;
		const templateId = this.getNodeParameter('templateId', 0) as string;
		const sequenceId = this.getNodeParameter('sequenceId', 0) as string;

		/** 2. Fetch templates */
		const templateResp = await this.helpers.httpRequest({
			method: 'POST',
			baseURL: 'https://dev-api.inboxpl.us',
			url: '/user-emails/n8n/get-email-templates',
			headers: { api_key: apiKey },
			json: true,
		});

		const templates = templateResp?.templates || [];
		const template = templates.find((t: InboxPlusTemplate) => t.id === templateId || t._id === templateId);

		if (!template) {
			throw new NodeOperationError(this.getNode(), `Template not found for ID: ${templateId}`);
		}

		const subject = template.subject || 'No Subject';
		const rawBody = template.body || '';

		/** 3. HTML escape */
		const safeBody = escapeHtmlForJson(rawBody);

		/** 4. Generate thread + message ID */
		const threadId = generateUUID();
		const messageId = generateUUID();

		/** 5. Generate tracking ID */
		const trackingResp = await this.helpers.httpRequest({
			method: 'POST',
			baseURL: 'https://dev-api.inboxpl.us',
			url: '/user-emails/n8n/tracking-id',
			headers: { api_key: apiKey },
			json: true,
		});

		const trackingId = trackingResp.trackingId;

		let trackingImage = '';
		if (trackingResp.trackingImage) {
			const match = trackingResp.trackingImage.match(/src="([^"]+)"/);
			if (match) trackingImage = match[1];
		}

		/** 6. Fetch sender email from org */
		const senderResp = await this.helpers.httpRequest({
			method: 'GET',
			baseURL: 'https://dev-api.inboxpl.us',
			url: '/auth/organization/users',
			headers: { api_key: apiKey },
			json: true,
		});

		const sender: InboxPlusUser | undefined = senderResp?.users?.[0];
		const senderEmail = sender?.email || 'unknown@sender';

		/** 7. Build final payload */
		const payload = {
			recipient_email: recipientEmail,
			subject,
			body: safeBody,
			threadId,
			message_id: messageId,
			tracking_id: trackingId,
			tracking_image: trackingImage,
			sender_email: senderEmail,
			sequenceId,
		};

		/** 8. Validate JSON */
		JSON.stringify(payload); // will throw on invalid JSON

		/** 9. Send email */
		const sendResp = await this.helpers.httpRequest({
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

		/** 10. Return output */
		const output: INodeExecutionData = {
			json: {
				success: sendResp?.success === 1,
				apiResponse: sendResp,
				recipientEmail,
				templateId,
				sequenceId,
				threadId,
				message_id: messageId,
				trackingId,
				trackingImage,
				sender_email: senderEmail,
				safeBody,
			},
		};

		return [[output]];
	}
}
