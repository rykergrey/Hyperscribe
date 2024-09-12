export interface Session {
  name: string;
  youtubeUrl: string;
  rawTranscript: string;
  sandboxText: string;
  summary: string;
  question: string;
  answer: string;
}

export const saveSession = (session: Session): void => {
  const sessions = getSessions();
  sessions[session.name] = session;
  localStorage.setItem('sessions', JSON.stringify(sessions));
};

export const loadSession = (name: string): Session | null => {
  const sessions = getSessions();
  return sessions[name] || null;
};

export const getSessions = (): Record<string, Session> => {
  const sessionsJson = localStorage.getItem('sessions');
  return sessionsJson ? JSON.parse(sessionsJson) : {};
};

export const getSessionNames = (): string[] => {
  return Object.keys(getSessions());
};