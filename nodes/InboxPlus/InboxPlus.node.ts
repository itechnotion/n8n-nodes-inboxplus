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

/** ------------------ UUID Generator (NO crypto import) ------------------ */
function generateUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/** ------------------ API Response Interfaces ------------------ */
interface InboxPlusTemplate {
	id?: string;
	_id?: string;
	template_name?: string;
	subject?: string;
}

interface InboxPlusSequence {
	id?: string;
	_id?: string;
	sequence_name?: string;
}

export class InboxPlus implements INodeType {

	/** ---------------------------------------------------------
	 *             NODE DESCRIPTION  
	 * --------------------------------------------------------- */
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
		description: 'Complete InboxPlus workflow in one step',

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
			/** --- Operation --- */
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
						action: 'Start workflow',
						description: 'Generate tracking ID → Send Template → Trigger Sequence',
					},
				],
			},

			/** --- Template Dropdown --- */
			{
				displayName: 'Template Name or ID',
				name: 'templateId',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getTemplates',
				},
				displayOptions: {
					show: { operation: ['startWorkflow'] },
				},
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},

			/** --- Sequence Dropdown --- */
			{
				displayName: 'Sequence Name or ID',
				name: 'sequenceId',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'getSequences',
				},
				displayOptions: {
					show: { operation: ['startWorkflow'] },
				},
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
		],
	};

	/** ---------------------------------------------------------
	 *             METHODS (OUTSIDE DESCRIPTION)
	 * --------------------------------------------------------- */
	methods = {

		loadOptions: {

			/** ---- Load Templates ---- */
			async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const apiKey = (await this.getCredentials('inboxPlusApi')).apiKey as string;

				const resp = await this.helpers.httpRequest({
					method: 'POST',
					baseURL: 'https://dev-api.inboxpl.us',
					url: '/user-emails/n8n/get-email-templates',
					headers: { api_key: apiKey },
				});

				const list = (resp?.templates || []) as InboxPlusTemplate[];

				return list.map((t) => ({
					name: t.template_name || t.subject || 'Untitled',
					value: t.id || t._id || '',
				}));
			},

			/** ---- Load Sequences ---- */
			async getSequences(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const apiKey = (await this.getCredentials('inboxPlusApi')).apiKey as string;

				const resp = await this.helpers.httpRequest({
					method: 'POST',
					baseURL: 'https://dev-api.inboxpl.us',
					url: '/user-emails/n8n/get-sequences',
					headers: { api_key: apiKey },
				});

				const list = (resp?.sequences || []) as InboxPlusSequence[];

				return list.map((s) => ({
					name: s.sequence_name || 'Untitled Sequence',
					value: s.id || s._id || '',
				}));
			},
		},
	};

	/** ---------------------------------------------------------
	 *                    Credential Test
	 * --------------------------------------------------------- */
	async ping(this: IExecuteFunctions) {
		const apiKey = (await this.getCredentials('inboxPlusApi')).apiKey as string;

		try {
			await this.helpers.httpRequest({
				method: 'POST',
				baseURL: 'https://dev-api.inboxpl.us',
				url: '/user-emails/n8n/get-email-templates',
				headers: { api_key: apiKey },
			});
		} catch {
			throw new NodeOperationError(this.getNode(), 'Invalid API Key');
		}
	}

	/** ---------------------------------------------------------
	 *                       EXECUTION
	 * --------------------------------------------------------- */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const output: INodeExecutionData[] = [];

		const apiKey = (await this.getCredentials('inboxPlusApi')).apiKey as string;
		const base = 'https://dev-api.inboxpl.us/user-emails/n8n';

		const json = items[0].json as IDataObject;

		/** ------------------ Extract Email ------------------ */
		let contactEmail =
			(json.email as string) ||
			(json.to as string) ||
			(json.recipient as string) ||
			(json.toEmail as string) ||
			(json.To as string) ||
			(json.From as string) ||
			(json.from as string);

		// Gmail fallback
		if (!contactEmail && json.payload && typeof json.payload === 'object') {
			const headers = (json.payload as IDataObject).headers;
			if (Array.isArray(headers)) {
				const h = headers.find(
					(h: IDataObject) => h.name === 'To' && typeof h.value === 'string',
				);
				if (h?.value) contactEmail = h.value as string;
			}
		}

		if (!contactEmail) {
			throw new NodeOperationError(
				this.getNode(),
				'Email not found in input. Connect Gmail node → InboxPlus node',
			);
		}

		/** ------------------ Generate Tracking ID ------------------ */
		const trackingId = generateUUID();
		const trackingImage = `${base}/tracking-image/${trackingId}`;

		/** ------------------ Node Parameters ------------------ */
		const templateId = this.getNodeParameter('templateId', 0) as string;
		const sequenceId = this.getNodeParameter('sequenceId', 0) as string;

		/** ------------------ Send Template Email ------------------ */
		const sendResp = await this.helpers.httpRequest({
			method: 'POST',
			baseURL: base,
			url: '/',
			headers: { api_key: apiKey, 'Content-Type': 'application/json' },
			body: {
				recipient_email: contactEmail,
				subject: json.Subject,
				threadId: json.threadId || json.threadID || json.thread_id,
				message_id: json.id,
				sender_email: json.From || json.from,
				tracking_id: trackingId,
				sequenceId,
			},
			json: true,
		});

		/** ------------------ Trigger Sequence ------------------ */
		const seqResp = await this.helpers.httpRequest({
			method: 'POST',
			baseURL: base,
			url: '/',
			headers: { api_key: apiKey, 'Content-Type': 'application/json' },
			body: {
				recipient_email: contactEmail,
				subject: json.Subject,
				threadId: json.threadId || json.threadID || json.thread_id,
				message_id: json.id,
				sender_email: json.From || json.from,
				tracking_id: trackingId,
				sequenceId: sequenceId 
			},
			json: true,
		});


		/** ------------------ Final Output ------------------ */
		output.push({
			json: {
				success: true,
				contactEmail,
				trackingId,
				trackingImage,
				templateId,
				sequenceId,
				templateSent: sendResp,
				sequenceTriggered: seqResp,
			},
		});

		return [output];
	}
}
