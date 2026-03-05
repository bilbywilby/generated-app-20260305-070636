import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { IllustrativeCard } from '@/components/ui/illustrative-card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield, Zap, Bell, Globe, Sparkles, Key } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
export default function SettingsPage() {
  return (
    <AppLayout container>
      <div className="max-w-4xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground font-medium text-lg mt-2">Adjust your AI engine and communication preferences.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <nav className="flex flex-col gap-1">
              {[
                { label: 'Profile', icon: User, active: true },
                { label: 'AI Engine', icon: Sparkles, active: false },
                { label: 'Integrations', icon: Zap, active: false },
                { label: 'Security', icon: Shield, active: false },
                { label: 'Notifications', icon: Bell, active: false },
              ].map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`justify-start btn-soft ${item.active ? 'bg-primary/10 text-primary hover:bg-primary/15' : ''}`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </aside>
          <main className="lg:col-span-3 space-y-8">
            <IllustrativeCard className="p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">User Profile</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Tony Stark" className="input-rounded" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="tony@stark.com" className="input-rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio / Organization</Label>
                <Input placeholder="Stark Industries" className="input-rounded" />
              </div>
            </IllustrativeCard>
            <IllustrativeCard className="p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">AI Preferences</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Creativity Temperature</Label>
                    <span className="text-xs font-bold text-primary">0.7</span>
                  </div>
                  <Slider defaultValue={[70]} max={100} step={1} className="w-full" />
                  <p className="text-xs text-muted-foreground italic">Higher values generate more unexpected and varied drafts.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Tone</Label>
                    <Select defaultValue="professional">
                      <SelectTrigger className="input-rounded">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="urgent">Urgent & Direct</SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-right flex flex-col justify-end">
                    <div className="flex items-center justify-end gap-3 h-10">
                      <Label htmlFor="ai-autosave">Auto-polish drafts</Label>
                      <Switch id="ai-autosave" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </IllustrativeCard>
            <IllustrativeCard className="p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                  <Key className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">Channel Adapters</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-bold">Slack Bot Token</div>
                        <div className="text-xs text-muted-foreground">xoxb-....</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="btn-soft border-border">Configure</Button>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-bold">SMTP Server</div>
                        <div className="text-xs text-muted-foreground">Not connected</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="btn-soft border-border">Connect</Button>
                  </div>
                </div>
              </div>
            </IllustrativeCard>
            <div className="flex justify-end gap-4">
              <Button variant="ghost" className="btn-soft">Reset Defaults</Button>
              <Button className="btn-soft bg-primary text-white px-8">Save All Changes</Button>
            </div>
          </main>
        </div>
      </div>
    </AppLayout>
  );
}