import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	NodeOperationError,
} from 'n8n-workflow';

export class InboxPlus implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'InboxPlus',
		name: 'inboxPlus',
		icon: 'file:inboxplus.svg',  // MUST be SVG for n8n
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Integrate InboxPlus API',
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
			// ---------------------------
			// Resource
			// ---------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Ping',
						value: 'ping',
					},
				],
				default: 'ping',
			},

			// ---------------------------
			// Operation
			// ---------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Ping API',
						value: 'pingEndpoint',
						action: 'Ping the inboxplus API',
						description: 'Checks if API + API key works',
					},
				],
				default: 'pingEndpoint',
			},
		],
	};

	// -----------------------------------
	// EXECUTE
	// -----------------------------------
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('inboxPlusApi');

		const baseUrl = 'https://api.inboxpl.us';   // ✔ correct API base URL

		// ---------------------------
		// PING OPERATION
		// ---------------------------
		if (resource === 'ping' && operation === 'pingEndpoint') {
			const options: IHttpRequestOptions = {
				method: 'GET',
				url: `${baseUrl}/ping`,   // replace when sir gives real endpoint
				headers: {
					Authorization: `Bearer ${credentials.apiKey}`,
				},
			};

			const response = await this.helpers.httpRequest(options);

			returnData.push({
				json: {
					success: true,
					message: 'InboxPlus API ping successful',
					data: response,
				},
			});

			return [returnData];
		}

		throw new NodeOperationError(this.getNode(), 'Operation not implemented');
	}
}
