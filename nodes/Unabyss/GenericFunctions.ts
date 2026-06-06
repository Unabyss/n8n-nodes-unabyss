import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export const MCP_URL = 'https://mcp.unabyss.com';

export type McpToolResult = {
	text?: string;
	structured?: Record<string, unknown>;
	isError: boolean;
};

type JsonRpcResponse = {
	error?: { message?: string };
	result?: {
		isError?: boolean;
		content?: Array<{ text?: string }>;
		structuredContent?: Record<string, unknown>;
	};
};

export function resolveCredentialType(authentication: string): string {
	return authentication === 'apiToken' ? 'unabyssMcpTokenApi' : 'unabyssMcpOAuth2Api';
}

export async function mcpToolCall(
	this: IExecuteFunctions,
	credentialType: string,
	toolName: string,
	args: Record<string, unknown>,
	itemIndex: number,
): Promise<McpToolResult> {
	const options: IHttpRequestOptions = {
		method: 'POST',
		url: MCP_URL,
		headers: {
			Accept: 'application/json, text/event-stream',
			'Content-Type': 'application/json',
		},
		body: {
			jsonrpc: '2.0',
			id: 1,
			method: 'tools/call',
			params: {
				name: toolName,
				arguments: args,
			},
		},
		json: true,
	};

	let response: JsonRpcResponse;
	try {
		response = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			credentialType,
			options,
		)) as JsonRpcResponse;
	} catch (error) {
		throw new NodeApiError(
			this.getNode(),
			{ message: error instanceof Error ? error.message : 'MCP request failed' },
			{ itemIndex },
		);
	}

	if (response.error) {
		throw new NodeApiError(
			this.getNode(),
			{ message: response.error.message ?? 'MCP JSON-RPC error' },
			{ itemIndex },
		);
	}

	const result = response.result;
	const text = result?.content?.[0]?.text;
	const isError = result?.isError ?? false;

	if (isError) {
		throw new NodeApiError(
			this.getNode(),
			{ message: text ?? 'MCP tool returned an error' },
			{ itemIndex },
		);
	}

	return {
		text,
		structured: result?.structuredContent,
		isError,
	};
}
