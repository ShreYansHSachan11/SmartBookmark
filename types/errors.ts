export interface ValidationError {
  field: 'url' | 'title';
  message: string;
}

export interface AuthError {
  type: 'oauth_failed' | 'session_expired' | 'network_error';
  message: string;
  retryable: boolean;
}

export interface BookmarkError {
  type: 'validation' | 'database' | 'permission' | 'network';
  field?: 'url' | 'title';
  message: string;
}

export interface RealtimeError {
  type: 'connection_lost' | 'subscription_failed' | 'parse_error';
  message: string;
  reconnectable: boolean;
}
