import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class InboxPlus implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'InboxPlus',
		name: 'inboxPlus',
		icon: 'file:inboxplus.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ":" + $parameter["operation"]}}',
		description: 'Interact with the InboxPlus HTTP API',
		defaults: {
			name: 'InboxPlus',
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{ name: 'Ping', value: 'ping' },
					{ name: 'Email', value: 'email' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Sequence', value: 'sequence' },
					{ name: 'Template', value: 'template' },
				],
				default: 'ping',
			},

			// Ping has only one operation
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['ping'] } },
				options: [{ name: 'Ping API', value: 'ping' }],
				default: 'ping',
			},

			// Email operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['email'] } },
				options: [{ name: 'Send Email', value: 'send' }],
				default: 'send',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['email'], operation: ['send'] } },
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['email'], operation: ['send'] } },
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: { alwaysOpenEditWindow: true },
				default: '',
				displayOptions: { show: { resource: ['email'], operation: ['send'] } },
			},

			// Contact operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['contact'] } },
				options: [
					{ name: 'Create Contact', value: 'create' },
					{ name: 'Get Contact', value: 'get' },
				],
				default: 'create',
			},
			{
				displayName: 'Contact Email',
				name: 'contactEmail',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['contact'], operation: ['create', 'get'] } },
			},
			{
				displayName: 'Contact Data (JSON)',
				name: 'contactData',
				type: 'json',
				default: {},
				displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
			},

			// Sequence operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['sequence'] } },
				options: [{ name: 'Trigger Sequence', value: 'trigger' }],
				default: 'trigger',
			},
			{
				displayName: 'Sequence ID',
				name: 'sequenceId',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['sequence'], operation: ['trigger'] } },
			},

			// Template operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['template'] } },
				options: [{ name: 'List Templates', value: 'list' }],
				default: 'list',
			},
		],
	};

	methods = {};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const results: INodeExecutionData[] = [];

		// load credentials
		const credentials = this.getCredentials('inboxPlusApi') as {
			apiKey: string;
			headerName?: string;
			baseUrl?: string;
		};

		if (!credentials || !credentials.apiKey) {
			throw new NodeOperationError(this.getNode(), 'No InboxPlus credentials set.');
		}

		const baseUrl = (credentials.baseUrl || 'https://api.inboxpl.us/').replace(/\/+$/, '');
		const headerName = credentials.headerName || 'Authorization';
		const authHeader =
			headerName.toLowerCase() === 'authorization' ? `Bearer ${credentials.apiKey}` : credentials.apiKey;

		const doRequest = async (method: string, path: string, body?: IDataObject, qs?: IDataObject) => {
			const options: any = {
				method,
				uri: `${baseUrl}${path}`,
				json: true,
				headers: {
					[headerName]: authHeader,
					'Content-Type': 'application/json',
				},
				timeout: 30000,
			};
			if (body !== undefined) options.body = body;
			if (qs !== undefined) options.qs = qs;
			return (this.helpers.request as any).call(this, options);
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let response: any;

				// PING - simple check to see server responds
				if (resource === 'ping' && operation === 'ping') {
					// simple GET to base URL (many APIs provide a root or /ping)
					response = await doRequest('GET', '/');
					results.push({ json: response as IDataObject });
					continue;
				}

				// EMAIL
				if (resource === 'email') {
					if (operation === 'send') {
						const to = this.getNodeParameter('to', i) as string;
						const subject = this.getNodeParameter('subject', i) as string;
						const body = this.getNodeParameter('body', i) as string;

						// === REPLACE this path with InboxPlus's real email endpoint ===
						response = await doRequest('POST', '/v1/emails/send', { to, subject, body });
						results.push({ json: response as IDataObject });
						continue;
					}
				}

				// CONTACT
				if (resource === 'contact') {
					if (operation === 'create') {
						const contactEmail = this.getNodeParameter('contactEmail', i) as string;
						const contactData = this.getNodeParameter('contactData', i) as IDataObject;
						// === REPLACE with real endpoint ===
						response = await doRequest('POST', '/v1/contacts', { email: contactEmail, ...contactData });
						results.push({ json: response as IDataObject });
						continue;
					} else if (operation === 'get') {
						const contactEmail = this.getNodeParameter('contactEmail', i) as string;
						// === REPLACE with real endpoint ===
						response = await doRequest('GET', `/v1/contacts/${encodeURIComponent(contactEmail)}`);
						results.push({ json: response as IDataObject });
						continue;
					}
				}

				// SEQUENCE
				if (resource === 'sequence') {
					if (operation === 'trigger') {
						const sequenceId = this.getNodeParameter('sequenceId', i) as string;
						// === REPLACE with real endpoint ===
						response = await doRequest('POST', `/v1/sequences/${encodeURIComponent(sequenceId)}/trigger`);
						results.push({ json: response as IDataObject });
						continue;
					}
				}

				// TEMPLATE
				if (resource === 'template') {
					if (operation === 'list') {
						// === REPLACE with real endpoint ===
						response = await doRequest('GET', '/v1/templates');
						results.push({ json: response as IDataObject });
						continue;
					}
				}

				throw new NodeOperationError(this.getNode(), `Unsupported resource/operation: ${resource}/${operation}`);
			} catch (error: any) {
				results.push({ json: { error: error?.message ?? String(error) } });
			}
		}

		return [results];
	}
}
