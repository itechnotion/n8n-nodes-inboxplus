import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IDataObject,
} from 'n8n-workflow';

import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

// Simple UUID v4 generator (no external dependencies)
function generateUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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

		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],

		credentials: [
			{
				name: 'inboxPlusApi',
				required: true,
			},
		],

		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'hidden',
				default: 'email',
				options: [
					{
						name: 'Email',
						value: 'email',
					},
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Select Template',
						value: 'prepareEmail',
						description: 'Load template and generate tracking for Gmail',
						action: 'Select a template',
					},
					{
						name: 'Attach Sequence',
						value: 'startSequence',
						description: 'Record sent email and start automated follow-up sequence',
						action: 'Attach a sequence',
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
				// Use new API-key compatible endpoint
				const resp = await this.helpers.httpRequestWithAuthentication.call(this, 'inboxPlusApi', {
					method: 'POST',
					baseURL: 'https://api.inboxpl.us',
					url: '/user-emails/api/get-user-info',
					json: true,
				});

				// Extract templates from user info response
				const userInfo = resp.body || resp;
				const list = (userInfo.templates as InboxPlusTemplate[]) || [];

				return list.map((t) => ({
					name: t.template_name || 'Untitled Template',
					value: t.id || t._id || '',
				}));
			},

			async getSequences(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				// Use new API-key compatible endpoint
				const resp = await this.helpers.httpRequestWithAuthentication.call(this, 'inboxPlusApi', {
					method: 'POST',
					baseURL: 'https://api.inboxpl.us',
					url: '/user-emails/api/get-user-info',
					json: true,
				});

				// Extract sequences from user info response
				const userInfo = resp.body || resp;
				const list = (userInfo.sequences as InboxPlusSequence[]) || [];

				return list.map((s) => ({
					name: s.sequence_name || 'Untitled Sequence',
					value: s.id || s._id || '',
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Loop through all input items
		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				// ========== PREPARE EMAIL OPERATION ==========
				if (operation === 'prepareEmail') {
					const recipientEmail = this.getNodeParameter('recipientEmail', i) as string;
					const templateId = this.getNodeParameter('templateId', i) as string;

					// Generate tracking ID (like extension does)
					const trackingId = generateUUID();
					const trackingImage = `<img src="https://api.inboxpl.us/track/${trackingId}&&&" style="display: none; width: 1px; height: 1px;">`;

					// Fetch user info which includes templates (using API-key compatible endpoint)
					const userInfoResp = await this.helpers.httpRequestWithAuthentication.call(this, 'inboxPlusApi', {
						method: 'POST',
						baseURL: 'https://api.inboxpl.us',
						url: '/user-emails/api/get-user-info',
						json: true,
					});

					const userInfo = userInfoResp.body || userInfoResp;
					const templates = (userInfo.templates as InboxPlusTemplate[]) || [];
					const template = templates.find((t) => [t.id, t._id].includes(templateId));

					if (!template) {
						throw new NodeOperationError(this.getNode(), `Template not found: ${templateId}`);
					}

					// Prepare body with tracking image for Gmail
					const gmailBodyHtml = `${template.body}<br>${trackingImage}`;

					returnData.push({
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
							organizationId: userInfo.organization_id, // Include org ID for next step
						},
						pairedItem: { item: i },
					});
				}

				// ========== START SEQUENCE OPERATION ==========
				else if (operation === 'startSequence') {
					const senderEmail = (this.getNodeParameter('sequenceSenderEmail', i) as string).trim();
					const recipientEmail = (this.getNodeParameter('sequenceRecipientEmail', i) as string).trim();
					const subject = (this.getNodeParameter('subject', i) as string).trim();
					const threadId = (this.getNodeParameter('threadId', i) as string).trim();
					const messageId = (this.getNodeParameter('messageId', i) as string).trim();
					const trackingId = (this.getNodeParameter('trackingId', i) as string).trim();
					const sequenceId = this.getNodeParameter('sequenceId', i) as string;

					// Validate required fields
					if (!senderEmail || !recipientEmail || !subject || !threadId || !messageId || !trackingId || !sequenceId) {
						throw new NodeOperationError(
							this.getNode(),
							'All fields are required. Make sure Prepare Email and Gmail nodes are connected.',
						);
					}

					// Get organization ID from user info (using API-key compatible endpoint)
					const userInfoResp = await this.helpers.httpRequestWithAuthentication.call(this, 'inboxPlusApi', {
						method: 'POST',
						baseURL: 'https://api.inboxpl.us',
						url: '/user-emails/api/get-user-info',
						json: true,
					});

					const userInfo = userInfoResp.body || userInfoResp;
					const organizationId = userInfo.organization_id;

					if (!organizationId) {
						throw new NodeOperationError(this.getNode(), 'Unable to get organization ID from user info');
					}

					// Build payload matching extension format
					const payload: IDataObject = {
						sender_email: senderEmail,
						recipient_email: recipientEmail,
						message_id: messageId,
						subject: subject,
						sequence_id: sequenceId,
						organization_id: organizationId,
						tracking_id: trackingId,
						ourNewThreadId: threadId,
					};

					// Call API-key compatible endpoint to save email data
					const resp = await this.helpers.httpRequestWithAuthentication.call(this, 'inboxPlusApi', {
						method: 'POST',
						baseURL: 'https://api.inboxpl.us',
						url: '/user-emails/api/create',
						body: payload,
						json: true,
					});

					returnData.push({
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
							organizationId,
							apiResponse: resp,
						},
						pairedItem: { item: i },
					});
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
