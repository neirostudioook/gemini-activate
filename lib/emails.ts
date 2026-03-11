// In-memory email store with persistent state during runtime
// On Vercel: loaded from INITIAL_EMAILS env var on cold start

interface EmailEntry {
  email: string;
  activated: boolean;
  activatedAt?: string;
}

// In-memory storage
let emailStore: EmailEntry[] = [];

// Initialize from environment on first load
function initializeFromEnv(): void {
  if (emailStore.length > 0) return;

  const initialEmails = process.env.INITIAL_EMAILS;
  if (initialEmails) {
    const emails = initialEmails
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    emailStore = emails.map((email) => ({
      email,
      activated: false,
    }));
  }
}

// Initialize on module load
initializeFromEnv();

export function getEmails(): EmailEntry[] {
  return [...emailStore];
}

export function addEmails(emails: string[]): { added: number; duplicates: number } {
  let added = 0;
  let duplicates = 0;

  for (const rawEmail of emails) {
    const email = rawEmail.trim().toLowerCase();
    if (!email) continue;

    const exists = emailStore.some((e) => e.email === email);
    if (exists) {
      duplicates++;
    } else {
      emailStore.push({ email, activated: false });
      added++;
    }
  }

  return { added, duplicates };
}

export function checkEmail(email: string): { found: boolean; activated: boolean } {
  const normalizedEmail = email.trim().toLowerCase();
  const entry = emailStore.find((e) => e.email === normalizedEmail);

  if (!entry) {
    return { found: false, activated: false };
  }

  return { found: true, activated: entry.activated };
}

export function markActivated(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const entry = emailStore.find((e) => e.email === normalizedEmail);

  if (!entry) return false;

  entry.activated = true;
  entry.activatedAt = new Date().toISOString();
  return true;
}

export function removeEmail(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const index = emailStore.findIndex((e) => e.email === normalizedEmail);

  if (index === -1) return false;

  emailStore.splice(index, 1);
  return true;
}

export function getStats(): { total: number; activated: number; pending: number } {
  const total = emailStore.length;
  const activated = emailStore.filter((e) => e.activated).length;
  return { total, activated, pending: total - activated };
}
