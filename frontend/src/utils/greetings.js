// Utility to get a time-based greeting
export function getGreeting(name) {
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Hello';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  return name ? `${greeting}, ${name}!` : `${greeting}!`;
} 