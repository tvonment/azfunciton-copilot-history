import { app, HttpRequest, HttpResponseInit, input, InvocationContext } from '@azure/functions';

const cosmosInput = input.cosmosDB({
    databaseName: 'copilot',
    containerName: 'chathistories',
    id: '{Query.id}',
    partitionKey: '{Query.id}',
    connection: 'COSMOS_DB_CONNECTION_STRING',
});

// Define a TypeScript interface for the history item
interface History {
    id: string;
    history: any[];
}

export async function GetHistory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const history = <History>context.extraInputs.get(cosmosInput);
    if (!history) {
        return {
            status: 404,
            body: 'History Item item not found',
        };
    } else {
        return {
            status: 200,
            body: JSON.stringify({ id: history.id, history: history.history }),
        };
    }
};

app.http('GetHistory', {
    methods: ['GET'],
    authLevel: 'function',
    extraInputs: [cosmosInput],
    handler: GetHistory,
});