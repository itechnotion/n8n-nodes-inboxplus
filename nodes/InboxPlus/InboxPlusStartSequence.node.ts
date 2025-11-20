import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

interface InboxPlusSequence {
	id?: string;
	_id?: string;
	sequence_name?: string;
}

export class InboxPlusStartSequence implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'InboxPlus: Start Sequence',
		name: 'inboxPlusStartSequence',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		subtitle: 'Start InboxPlus sequence',
		description: 'Starts an InboxPlus sequence using Gmail message metadata',
		defaults: { name: 'InboxPlus Start Sequence' },
		icon: { light: 'file:logo.svg', dark: 'file:logo.dark.svg' },

		// 🔥 TWO INPUTS → Gmail & Prepare Email
		inputs: ['main', 'main'],
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
				default: '',
				required: true,
			},

			{
				displayName: 'Sequence Name or ID',
				name: 'sequenceId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getSequences',
				},
				default: '',
				required: true,
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},

			{
				displayName: 'Tracking ID',
				name: 'trackingId',
				type: 'string',
				default: '',
				required: true,
			},
		],
	};

	methods = {
		loadOptions: {
			/** Dynamically load InboxPlus sequences */
			async getSequences(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const creds = await this.getCredentials('inboxPlusApi');
				const apiKey = creds.apiKey as string;

				const resp = await this.helpers.httpRequest({
					method: 'POST',
					baseURL: 'https://dev-api.inboxpl.us',
					url: '/user-emails/n8n/get-sequences',
					headers: { api_key: apiKey },
					json: true,
				});

				const list = (resp.sequences as InboxPlusSequence[]) || [];

				return list.map((s) => ({
					name: s.sequence_name || 'Untitled Sequence',
					value: s.id || s._id || '',
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const creds = await this.getCredentials('inboxPlusApi');
		const apiKey = creds.apiKey as string;

		// 🔥 INPUT 0 = Gmail "Get Message"
		// 🔥 INPUT 1 = Prepare Email output
		const gmail = this.getInputData(0)[0]?.json || {};
		const prep = this.getInputData(1)[0]?.json || {};

		// Extract node parameters
		const recipientEmail = this.getNodeParameter('recipientEmail', 0) as string;
		const sequenceId = this.getNodeParameter('sequenceId', 0) as string;

		// Extract necessary metadata safely with fallbacks
		const trackingId = prep.trackingId || prep.tracking_id;

		const subject =
			gmail.subject ||
			gmail.Subject ||
			prep.subject ||
			prep.Subject;

		const senderEmail =
			gmail.from ||
			gmail.From ||
			gmail.sender_email ||
			prep.senderEmail;

		const threadId =
			gmail.threadId ||
			gmail.thread_id ||
			prep.threadId;

		const messageId =
			gmail.id ||
			gmail.messageId ||
			prep.id ||
			prep.messageId;

		// Required fields validation
		if (!trackingId || !subject || !senderEmail || !threadId || !messageId) {
			throw new NodeOperationError(
				this.getNode(),
				`Missing required metadata.
trackingId = ${trackingId}
subject = ${subject}
senderEmail = ${senderEmail}
threadId = ${threadId}
messageId = ${messageId}`
			);
		}

		// Payload for InboxPlus
		const payload = {
			recipient_email: recipientEmail,
			subject,
			threadId,
			message_id: messageId,
			sender_email: senderEmail,
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
						success: true,
						apiResponse: resp,
						sequenceId,
						trackingId,
					},
				},
			],
		];
	}
}
