import { app, InvocationContext, Timer } from "@azure/functions";

export async function KeepAlive(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('KeepAlive function processed request.');
    const timeStamp = new Date().toISOString();
    context.log('KeepAlive timer trigger function ran!', timeStamp);
}

app.timer('KeepAlive', {
    schedule: '0 */5 * * * *',
    handler: KeepAlive
});
