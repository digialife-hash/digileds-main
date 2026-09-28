const counters = new Map();
const startedAt = Date.now();

export function increment(name, value = 1) {
  const current = counters.get(name) || 0;
  counters.set(name, current + value);
}

export function prometheus() {
  const lines = [
    "# HELP demo_manager_uptime_seconds Process uptime in seconds",
    "# TYPE demo_manager_uptime_seconds gauge",
    `demo_manager_uptime_seconds ${Math.floor(
      (Date.now() - startedAt) / 1000,
    )}`,
  ];

  for (const [name, value] of counters.entries()) {
    lines.push(`# TYPE ${name} counter`);
    lines.push(`${name} ${value}`);
  }

  return `${lines.join("\n")}\n`;
}
