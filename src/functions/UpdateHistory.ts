import { app, input, output, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

const cosmosInput = input.cosmosDB({
    databaseName: 'copilot',
    containerName: 'chathistories',
    id: '{Query.id}',
    partitionKey: '{Query.id}',
    connection: 'COSMOS_DB_CONNECTION_STRING',
});

const cosmosOutput = output.cosmosDB({
    databaseName: 'copilot',
    containerName: 'chathistories',
    connection: 'COSMOS_DB_CONNECTION_STRING',
})

interface History {
    id: string;
    history: HistoryItem[];
}

interface HistoryItem {
    inputs: { query: string };
    outputs: { reply: string };
}


export async function UpdateHistory(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const history = <History>context.extraInputs.get(cosmosInput);
    const historyItem = await request.json() as HistoryItem;

    context.log(`Updated history item with id: ${history.id}`);

    if (!history) {
        return {
            status: 404,
            body: 'History Item item not found',
        };
    } else {
        history.history.push(historyItem);
        context.extraOutputs.set(cosmosOutput, history);
        return {
            status: 200,
            body: JSON.stringify({ id: history.id, history: history.history }),
        };
    }
};

app.http('UpdateHistory', {
    methods: ['POST'],
    authLevel: 'function',
    extraInputs: [cosmosInput],
    extraOutputs: [cosmosOutput],
    handler: UpdateHistory
});
