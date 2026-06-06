import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { mcpToolCall, resolveCredentialType } from './GenericFunctions';

export class Unabyss implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Unabyss',
		name: 'unabyss',
		icon: { light: 'file:unabyss.svg', dark: 'file:unabyss.dark.svg' },
		group: ['transform'],
		version: [1],
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Personal memory for AI workflows - query, store, export, and inspect integrations via Unabyss MCP',
		documentationUrl: 'https://unabyss.com',
		defaults: {
			name: 'Unabyss',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'unabyssMcpOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oauth2'],
					},
				},
			},
			{
				name: 'unabyssMcpTokenApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiToken'],
					},
				},
			},
		],
		properties: [
			{
				displayName:
					'<a href="https://unabyss.com" target="_blank">Unabyss</a> is personal memory for AI: query what you know, store new facts, run deep research, and manage markdown exports. Connects to <a href="https://mcp.unabyss.com" target="_blank">mcp.unabyss.com</a> via MCP JSON-RPC.',
				name: 'unabyssNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				description:
					'OAuth2 (recommended) uses MCP Dynamic Client Registration. API Token accepts a static unby_mcp_... token from the Unabyss client app.',
				options: [
					{
						name: 'API Token',
						value: 'apiToken',
						description: 'Paste a static MCP token from the Unabyss client',
					},
					{
						name: 'OAuth2',
						value: 'oauth2',
						description: 'Sign in with browser consent via Dynamic Client Registration',
					},
				],
				default: 'oauth2',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				description:
					'Memory for Q&A and storage; Deep Query for multi-step research; Integrations for connected apps; Exports for markdown documents',
				options: [
					{
						name: 'Deep Query',
						value: 'deepQuery',
					},
					{
						name: 'Export',
						value: 'exports',
					},
					{
						name: 'Integration',
						value: 'integrations',
					},
					{
						name: 'Memory',
						value: 'memory',
					},
				],
				default: 'memory',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['memory'],
					},
				},
				options: [
					{
						name: 'Query',
						value: 'query',
						description: 'Ask a natural-language question against your Unabyss memory',
						action: 'Query memory',
					},
					{
						name: 'Store',
						value: 'store',
						description: 'Save text to your Unabyss memory',
						action: 'Store memory',
					},
					{
						name: 'Who Am I',
						value: 'whoAmI',
						description: 'Return your persisted identity summary',
						action: 'Get identity summary',
					},
				],
				default: 'query',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['deepQuery'],
					},
				},
				options: [
					{
						name: 'Agentic Query',
						value: 'agenticQuery',
						description: 'Deep multi-step memory query; may return pending + query_id',
						action: 'Run agentic query',
					},
					{
						name: 'Agentic Query Read',
						value: 'agenticQueryRead',
						description: 'Poll the result of a pending agentic query',
						action: 'Read agentic query result',
					},
				],
				default: 'agenticQuery',
			},
			{
				displayName:
					'Agentic Query may return status pending with a query_id. Add a Wait node (poll_after_seconds), then run Agentic Query Read until status is completed or failed.',
				name: 'agenticQueryNotice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						resource: ['deepQuery'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['integrations'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List connected apps and data source status',
						action: 'List integrations',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['exports'],
					},
				},
				options: [
					{
						name: 'Create From Text',
						value: 'createFromText',
						description: 'Save provided markdown as an export instantly',
						action: 'Create export from text',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List markdown exports',
						action: 'List exports',
					},
					{
						name: 'Read',
						value: 'read',
						description: 'Read full markdown content of a ready export',
						action: 'Read export',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Question',
				name: 'question',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['memory', 'deepQuery'],
						operation: ['query', 'agenticQuery'],
					},
				},
				description: 'Natural-language question (max 8 KB UTF-8)',
			},
			{
				displayName: 'Memory',
				name: 'memory',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['memory'],
						operation: ['store'],
					},
				},
				description: 'Text to persist (max 32 KB UTF-8)',
			},
			{
				displayName: 'Query ID',
				name: 'queryId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['deepQuery'],
						operation: ['agenticQueryRead'],
					},
				},
				description: 'UUID returned by Agentic Query when status was pending',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['exports'],
						operation: ['list'],
					},
				},
				description: 'Optional keywords to filter by title or topic',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				displayOptions: {
					show: {
						resource: ['exports'],
						operation: ['list'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Export ID',
				name: 'exportId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['exports'],
						operation: ['read'],
					},
				},
				description: 'UUID from Export List',
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: {
					rows: 6,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['exports'],
						operation: ['createFromText'],
					},
				},
				description: 'Markdown body to save as the export',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['exports'],
						operation: ['createFromText'],
					},
				},
				description: 'Optional title (auto-generated from content when omitted)',
			},
			{
				displayName: 'Topic Text',
				name: 'topicText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['exports'],
						operation: ['createFromText'],
					},
				},
				description: 'Regeneration prompt if the user later refreshes this export',
			},
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const authentication = this.getNodeParameter('authentication', itemIndex) as string;
				const credentialType = resolveCredentialType(authentication);
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				const output = await executeOperation.call(
					this,
					credentialType,
					resource,
					operation,
					itemIndex,
				);

				returnData.push({
					json: output,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				const message = error instanceof Error ? error.message : 'Operation failed';
				if (error instanceof NodeApiError) {
					throw new NodeApiError(this.getNode(), { message }, { itemIndex });
				}

				throw new NodeOperationError(this.getNode(), { message }, { itemIndex });
			}
		}

		return [returnData];
	}
}

async function executeOperation(
	this: IExecuteFunctions,
	credentialType: string,
	resource: string,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	if (resource === 'memory') {
		if (operation === 'query') {
			const question = this.getNodeParameter('question', itemIndex) as string;
			const { text, isError } = await mcpToolCall.call(this, credentialType, 'query', { question }, itemIndex);
			return { answer: text, isError };
		}

		if (operation === 'store') {
			const memory = this.getNodeParameter('memory', itemIndex) as string;
			const { text, structured, isError } = await mcpToolCall.call(
				this,
				credentialType,
				'store',
				{ memory },
				itemIndex,
			);
			return {
				text,
				source_ids: structured?.source_ids,
				isError,
			} as IDataObject;
		}

		if (operation === 'whoAmI') {
			const { text, isError } = await mcpToolCall.call(this, credentialType, 'whoami', {}, itemIndex);
			return { identity: text, isError };
		}
	}

	if (resource === 'deepQuery') {
		if (operation === 'agenticQuery') {
			const question = this.getNodeParameter('question', itemIndex) as string;
			const { text, structured, isError } = await mcpToolCall.call(
				this,
				credentialType,
				'agentic_query',
				{ question },
				itemIndex,
			);
			return {
				status: structured?.status,
				answer: structured?.answer,
				query_id: structured?.query_id,
				poll_after_seconds: structured?.poll_after_seconds,
				text,
				isError,
			} as IDataObject;
		}

		if (operation === 'agenticQueryRead') {
			const queryId = this.getNodeParameter('queryId', itemIndex) as string;
			const { text, structured, isError } = await mcpToolCall.call(
				this,
				credentialType,
				'agentic_query_read',
				{ query_id: queryId },
				itemIndex,
			);
			return {
				status: structured?.status,
				answer: structured?.answer,
				poll_after_seconds: structured?.poll_after_seconds,
				error: structured?.error,
				text,
				isError,
			} as IDataObject;
		}
	}

	if (resource === 'integrations' && operation === 'list') {
		const { text, structured, isError } = await mcpToolCall.call(
			this,
			credentialType,
			'list_integrations',
			{},
			itemIndex,
		);
		return {
			text,
			integrations: structured?.integrations,
			isError,
		} as IDataObject;
	}

	if (resource === 'exports') {
		if (operation === 'list') {
			const search = this.getNodeParameter('search', itemIndex, '') as string;
			const limit = this.getNodeParameter('limit', itemIndex, 25) as number;
			const args: Record<string, unknown> = {};
			if (search) {
				args.search = search;
			}
			if (limit) {
				args.limit = limit;
			}
			const { text, structured, isError } = await mcpToolCall.call(
				this,
				credentialType,
				'export_list',
				args,
				itemIndex,
			);
			return {
				text,
				exports: structured?.exports,
				isError,
			} as IDataObject;
		}

		if (operation === 'read') {
			const exportId = this.getNodeParameter('exportId', itemIndex) as string;
			const { text, structured, isError } = await mcpToolCall.call(
				this,
				credentialType,
				'export_read',
				{ export_id: exportId },
				itemIndex,
			);
			return {
				id: structured?.id,
				title: structured?.title,
				topic_text: structured?.topic_text,
				status: structured?.status,
				markdown: structured?.markdown,
				text,
				isError,
			} as IDataObject;
		}

		if (operation === 'createFromText') {
			const content = this.getNodeParameter('content', itemIndex) as string;
			const title = this.getNodeParameter('title', itemIndex, '') as string;
			const topicText = this.getNodeParameter('topicText', itemIndex, '') as string;
			const args: Record<string, unknown> = { content };
			if (title) {
				args.title = title;
			}
			if (topicText) {
				args.topic_text = topicText;
			}
			const { text, structured, isError } = await mcpToolCall.call(
				this,
				credentialType,
				'export_create_from_text',
				args,
				itemIndex,
			);
			return {
				id: structured?.id,
				title: structured?.title,
				status: structured?.status,
				text,
				isError,
			} as IDataObject;
		}
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation: ${resource}/${operation}`, {
		itemIndex,
	});
}
