import type {
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class UnabyssMcpOAuth2Api implements ICredentialType {
	name = 'unabyssMcpOAuth2Api';

	extends = ['mcpOAuth2Api'];

	displayName = 'Unabyss MCP OAuth2 API';

	icon: Icon = {
		light: 'file:../nodes/Unabyss/unabyss.svg',
		dark: 'file:../nodes/Unabyss/unabyss.dark.svg',
	};

	documentationUrl = 'https://unabyss.com';

	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'hidden',
			default: 'https://mcp.unabyss.com',
		},
		{
			displayName: 'Use Dynamic Client Registration',
			name: 'useDynamicClientRegistration',
			type: 'hidden',
			default: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'read write',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://mcp.unabyss.com',
			url: '/.well-known/oauth-protected-resource',
			method: 'GET',
		},
	};
}
