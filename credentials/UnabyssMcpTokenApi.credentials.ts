import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class UnabyssMcpTokenApi implements ICredentialType {
	name = 'unabyssMcpTokenApi';

	displayName = 'Unabyss MCP Token API';

	icon: Icon = {
		light: 'file:../nodes/Unabyss/unabyss.svg',
		dark: 'file:../nodes/Unabyss/unabyss.dark.svg',
	};

	documentationUrl = 'https://unabyss.com';

	properties: INodeProperties[] = [
		{
			displayName: 'MCP Token',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://mcp.unabyss.com',
			url: '/',
			method: 'POST',
			headers: {
				Accept: 'application/json, text/event-stream',
				'Content-Type': 'application/json',
			},
			body: {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/list',
			},
		},
	};
}
