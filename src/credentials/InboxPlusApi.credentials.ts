import { INodeProperties } from 'n8n-workflow';

export const inboxPlusApiCredentialType = {
  name: 'inboxPlusApi',
  displayName: 'InboxPlus API',
  properties: [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      default: '',
    },
    {
      displayName: 'API URL',
      name: 'apiUrl',
      type: 'string',
      default: 'https://api.inboxpl.us',
    },
  ],
} as unknown as INodeProperties;
