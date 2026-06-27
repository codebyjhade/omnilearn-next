import React, { useState, useEffect } from "react";
import { base44 } from "@/api/Base44Client";
import { AlertTriangle, Bell, BellOff, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Topics scoring below this threshold are considered "weak"
const WEAK_THRESHOLD = 65;

/** @param {any[]} attempts */
function computeWeakTopics(attempts) {
  const categoryMap = /** @type {{ [topic: string]: number[] }} */ ({});
  attempts.forEach((/** @type {any} */ a) => {
    (a.category_tags || []).forEach((/** @type {string} */ tag) => {
      if (!categoryMap[tag]) categoryMap[tag] = [];
      categoryMap[tag].push(a.score);
    });
  });
  return Object.entries(categoryMap)
    .map(([topic, scores]) => ({
      topic,
      avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
      attempts: scores.length,
    }))
    .filter((t) => t.avg < WEAK_THRESHOLD)
    .sort((a, b) => a.avg - b.avg);
}

export default function WeakTopicsPanel({ attempts }) {
  const [reminder, setReminder] = useState(/** @type {any|null} */ (null));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reminderTime, setReminderTime] = useState("morning");
  const [loading, setLoading] = useState(true);

  const weakTopics = computeWeakTopics(attempts);

  useEffect(() => {
    const load = async () => {
      const [me, reminders] = await Promise.all([
        base44.auth.me(),
        base44.entities.PracticeReminder.filter({ created_by_id: (await base44.auth.me()).id }),
      ]);
      if (reminders.length > 0) {
        setReminder(reminders[0]);
        setReminderTime(reminders[0].reminder_time || "morning");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleToggleReminder = async () => {
    setSaving(true);
    const me = await base44.auth.me();
    const weakTopicNames = weakTopics.map((t) => t.topic);

    if (reminder) {
      // Toggle enabled
      const updated = await base44.entities.PracticeReminder.update(reminder.id, {
        enabled: !reminder.enabled,
        weak_topics: weakTopicNames,
        reminder_time: reminderTime,
      });
      setReminder(updated);
    } else {
      // Create new
      const created = await base44.entities.PracticeReminder.create({
        email: me.email,
        reminder_time: reminderTime,
        weak_topics: weakTopicNames,
        enabled: true,
      });
      setReminder(created);
    }

    // Send a confirmation email
    if (!reminder || !reminder.enabled) {
      await base44.integrations.Core.SendEmail({
        to: me.email,
        subject: "✅ Daily practice reminders activated!",
        body: `Hi ${me.full_name?.split(" ")[0] || "there"},\n\nYou've set up daily practice reminders for your weak topics:\n\n${weakTopics.map((t) => `• ${t.topic} (avg score: ${t.avg}%)`).join("\n")}\n\nYou'll receive a reminder email each ${reminderTime} to keep practising. Keep it up!\n\n— ReviewKit`,
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpdateTopics = async () => {
    if (!reminder) return;
    setSaving(true);
    const updated = await base44.entities.PracticeReminder.update(reminder.id, {
      weak_topics: weakTopics.map((t) => t.topic),
      reminder_time: reminderTime,
    });
    setReminder(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return null;

  if (weakTopics.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <p className="text-sm font-semibold text-green-800">No weak topics!</p>
        </div>
        <p className="text-xs text-green-700 mt-1">You're scoring above {WEAK_THRESHOLD}% across all subjects. Great work!</p>
      </div>
    );
  }

  const remindersOn = reminder?.enabled;

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/50 mb-6 overflow-hidden">
      {/* Header */}
      <div className="bg-red-50 border-b border-red-100 px-4 py-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <p className="text-sm font-semibold text-red-800">Weak Topics — Need Practice</p>
      </div>

      {/* Topic list */}
      <div className="p-4 space-y-2.5">
        {weakTopics.map((t) => (
          <div key={t.topic} className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium truncate">{t.topic}</p>
                <span className="text-xs font-bold text-red-600 ml-2">{t.avg}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-red-400"
                  style={{ width: `${t.avg}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reminder setup */}
      <div className="px-4 pb-4 border-t border-border/50 pt-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Daily Reminder</p>
        <div className="flex gap-2 mb-3">
          {["morning", "afternoon", "evening"].map((t) => (
            <button
              key={t}
              onClick={() => setReminderTime(t)}
              className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all capitalize ${
                reminderTime === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Button
          onClick={remindersOn ? handleUpdateTopics : handleToggleReminder}
          variant={remindersOn ? "outline" : "default"}
          className="w-full h-10 text-sm rounded-xl"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <><Check className="w-4 h-4 mr-1.5" /> Saved!</>
          ) : remindersOn ? (
            <><Bell className="w-4 h-4 mr-1.5 text-primary" /> Update Reminders</>
          ) : (
            <><Bell className="w-4 h-4 mr-1.5" /> Enable Daily Reminders</>
          )}
        </Button>

        {remindersOn && (
          <button
            onClick={handleToggleReminder}
            disabled={saving}
            className="w-full text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1"
          >
            <BellOff className="w-3 h-3" /> Disable reminders
          </button>
        )}

        {remindersOn && (
          <p className="text-[11px] text-center text-muted-foreground mt-2">
            📧 Reminder emails sent each {reminderTime} to {reminder?.email}
          </p>
        )}
      </div>
    </div>
  );
}