import { app, output, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

const cosmosOutput = output.cosmosDB({
    databaseName: 'copilot',
    containerName: 'chathistories',
    connection: 'COSMOS_DB_CONNECTION_STRING',
})

// Define a TypeScript interface for the history item
interface History {
    id: string;
    history: any[];
}

export async function CreateHistory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    const id = await request.json() as { id: string };

    // Create a new history item with a GUID from the request body
    const newHistory: History = {
        id: id.id,
        history: []
    };

    // Insert the new history into the Cosmos DB
    context.extraOutputs.set(cosmosOutput, newHistory);

    context.log(`Created new history item with id: ${newHistory.id}`);

    return { body: JSON.stringify({ id: newHistory.id }) };
};

app.http('CreateHistory', {
    methods: ['POST'],
    authLevel: 'function',
    extraOutputs: [cosmosOutput],
    handler: CreateHistory
});