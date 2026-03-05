import { DurableObject } from 'cloudflare:workers';
import type { Env } from './core-utils';
export interface Template {
  id: string;
  name: string;
  content: string;
  schema: string[];
  category: string;
  updatedAt: number;
}
export interface Draft {
  id: string;
  title: string;
  content: string;
  templateId?: string;
  channel: 'email' | 'slack' | 'sms';
  status: 'draft' | 'sent' | 'archived';
  updatedAt: number;
}
export class AppController extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  // Generic list/get/put helpers
  private async getList<T>(key: string): Promise<T[]> {
    return await this.ctx.storage.get<T[]>(key) || [];
  }
  private async saveList<T>(key: string, items: T[]): Promise<void> {
    await this.ctx.storage.put(key, items);
  }
  // --- Template Management ---
  async createTemplate(template: Omit<Template, 'id' | 'updatedAt'>): Promise<Template> {
    const templates = await this.getList<Template>('templates');
    const newTemplate: Template = {
      ...template,
      id: crypto.randomUUID(),
      updatedAt: Date.now()
    };
    templates.push(newTemplate);
    await this.saveList('templates', templates);
    return newTemplate;
  }
  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template | null> {
    const templates = await this.getList<Template>('templates');
    const idx = templates.findIndex(t => t.id === id);
    if (idx === -1) return null;
    templates[idx] = { ...templates[idx], ...updates, updatedAt: Date.now() };
    await this.saveList('templates', templates);
    return templates[idx];
  }
  async listTemplates(): Promise<Template[]> {
    return await this.getList<Template>('templates');
  }
  async deleteTemplate(id: string): Promise<boolean> {
    const templates = await this.getList<Template>('templates');
    const filtered = templates.filter(t => t.id !== id);
    if (filtered.length === templates.length) return false;
    await this.saveList('templates', filtered);
    return true;
  }
  // --- Draft Management ---
  async createDraft(draft: Omit<Draft, 'id' | 'updatedAt'>): Promise<Draft> {
    const drafts = await this.getList<Draft>('drafts');
    const newDraft: Draft = {
      ...draft,
      id: crypto.randomUUID(),
      updatedAt: Date.now()
    };
    drafts.push(newDraft);
    await this.saveList('drafts', drafts);
    return newDraft;
  }
  async updateDraft(id: string, updates: Partial<Draft>): Promise<Draft | null> {
    const drafts = await this.getList<Draft>('drafts');
    const idx = drafts.findIndex(d => d.id === id);
    if (idx === -1) return null;
    drafts[idx] = { ...drafts[idx], ...updates, updatedAt: Date.now() };
    await this.saveList('drafts', drafts);
    return drafts[idx];
  }
  async listDrafts(): Promise<Draft[]> {
    const drafts = await this.getList<Draft>('drafts');
    return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async getDraft(id: string): Promise<Draft | null> {
    const drafts = await this.getList<Draft>('drafts');
    return drafts.find(d => d.id === id) || null;
  }
  async deleteDraft(id: string): Promise<boolean> {
    const drafts = await this.getList<Draft>('drafts');
    const filtered = drafts.filter(d => d.id !== id);
    if (filtered.length === drafts.length) return false;
    await this.saveList('drafts', filtered);
    return true;
  }
}