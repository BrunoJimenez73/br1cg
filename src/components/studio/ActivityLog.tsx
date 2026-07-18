// ──────────────────────────────────────────────
// br1cg — Activity Log (WS events)
// ──────────────────────────────────────────────

interface ActivityLogProps {
  logs: string[];
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 pt-3 pb-2">
        Activity
      </h3>
      <div className="flex-1 overflow-y-auto px-4 pb-3">
        {logs.length === 0 ? (
          <div className="text-xs text-gray-600 italic">No activity yet</div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="text-xs text-gray-500 font-mono truncate">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
