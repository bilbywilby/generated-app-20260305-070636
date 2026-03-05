import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController } from "./core-utils";
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
            const url = new URL(c.req.url);
            url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
            return agent.fetch(new Request(url.toString(), {
                method: c.req.method,
                headers: c.req.header(),
                body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
            }));
        } catch (error) {
            return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Templates API
    app.get('/api/templates', async (c) => {
        const controller = getAppController(c.env);
        const templates = await controller.listTemplates();
        return c.json({ success: true, data: templates });
    });
    app.post('/api/templates', async (c) => {
        const body = await c.req.json();
        const controller = getAppController(c.env);
        const template = await controller.createTemplate(body);
        return c.json({ success: true, data: template });
    });
    app.put('/api/templates/:id', async (c) => {
        const id = c.req.param('id');
        const body = await c.req.json();
        const controller = getAppController(c.env);
        const template = await controller.updateTemplate(id, body);
        return c.json({ success: !!template, data: template });
    });
    app.delete('/api/templates/:id', async (c) => {
        const id = c.req.param('id');
        const controller = getAppController(c.env);
        const deleted = await controller.deleteTemplate(id);
        return c.json({ success: deleted });
    });
    // Drafts API
    app.get('/api/drafts', async (c) => {
        const controller = getAppController(c.env);
        const drafts = await controller.listDrafts();
        return c.json({ success: true, data: drafts });
    });
    app.get('/api/drafts/:id', async (c) => {
        const id = c.req.param('id');
        const controller = getAppController(c.env);
        const draft = await controller.getDraft(id);
        return c.json({ success: !!draft, data: draft });
    });
    app.post('/api/drafts', async (c) => {
        const body = await c.req.json();
        const controller = getAppController(c.env);
        const draft = await controller.createDraft(body);
        return c.json({ success: true, data: draft });
    });
    app.put('/api/drafts/:id', async (c) => {
        const id = c.req.param('id');
        const body = await c.req.json();
        const controller = getAppController(c.env);
        const draft = await controller.updateDraft(id, body);
        return c.json({ success: !!draft, data: draft });
    });
    app.delete('/api/drafts/:id', async (c) => {
        const id = c.req.param('id');
        const controller = getAppController(c.env);
        const deleted = await controller.deleteDraft(id);
        return c.json({ success: deleted });
    });
}