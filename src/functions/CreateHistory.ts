import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { v4 as uuidv4 } from 'uuid';

// Initialize Cosmos DB client using connection string
const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
const client = new CosmosClient(connectionString);
const databaseId = 'copilot';
const containerId = 'chathistories';

// Define a TypeScript interface for the history item
interface HistoryItem {
    id: string;
    history: any[];
}

export async function CreateHistory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Create a new history item with a GUID as the identifier
    const newItem: HistoryItem = {
        id: uuidv4(),
        history: []
    };

    // Insert the new item into the Cosmos DB
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container } = await database.containers.createIfNotExists({ id: containerId });
    await container.items.create(newItem);

    context.log(`Created new history item with id: ${newItem.id}`);

    return { body: `Created new history item with id: ${newItem.id}` };
};

app.http('CreateHistory', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: CreateHistory
});