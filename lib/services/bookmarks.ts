import { supabase } from '@/lib/supabase/client';
import { Bookmark, Database } from '@/types/database';

export interface BookmarkError {
  type: 'validation' | 'database' | 'permission' | 'network';
  field?: 'url' | 'title';
  message: string;
}

/**
 * Creates a new bookmark for the authenticated user
 * @param url - The URL to bookmark
 * @param title - The title of the bookmark
 * @returns The created bookmark
 * @throws BookmarkError if creation fails
 */
export async function createBookmark(url: string, title: string): Promise<Bookmark> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw {
        type: 'permission',
        message: 'User must be authenticated to create bookmarks'
      } as BookmarkError;
    }

    const insertData = {
      user_id: user.id,
      url,
      title
    };

    const { data, error } = await supabase
      .from('bookmarks')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      throw {
        type: 'database',
        message: error.message || 'Failed to create bookmark'
      } as BookmarkError;
    }

    if (!data) {
      throw {
        type: 'database',
        message: 'No data returned after bookmark creation'
      } as BookmarkError;
    }

    return data as Bookmark;
  } catch (error) {
    if ((error as BookmarkError).type) {
      throw error;
    }
    throw {
      type: 'network',
      message: 'Network error while creating bookmark'
    } as BookmarkError;
  }
}

/**
 * Retrieves all bookmarks for the authenticated user
 * @returns Array of bookmarks
 * @throws BookmarkError if retrieval fails
 */
export async function getBookmarks(): Promise<Bookmark[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw {
        type: 'permission',
        message: 'User must be authenticated to view bookmarks'
      } as BookmarkError;
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw {
        type: 'database',
        message: error.message || 'Failed to retrieve bookmarks'
      } as BookmarkError;
    }

    return (data || []) as Bookmark[];
  } catch (error) {
    if ((error as BookmarkError).type) {
      throw error;
    }
    throw {
      type: 'network',
      message: 'Network error while retrieving bookmarks'
    } as BookmarkError;
  }
}

/**
 * Deletes a bookmark by ID
 * @param id - The ID of the bookmark to delete
 * @throws BookmarkError if deletion fails
 */
export async function deleteBookmark(id: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw {
        type: 'permission',
        message: 'User must be authenticated to delete bookmarks'
      } as BookmarkError;
    }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw {
        type: 'database',
        message: error.message || 'Failed to delete bookmark'
      } as BookmarkError;
    }
  } catch (error) {
    if ((error as BookmarkError).type) {
      throw error;
    }
    throw {
      type: 'network',
      message: 'Network error while deleting bookmark'
    } as BookmarkError;
  }
}

/**
 * Subscribes to real-time bookmark changes for the authenticated user
 * @param callback - Function to call when bookmarks change
 * @returns Unsubscribe function
 */
export function subscribeToBookmarks(
  callback: (bookmarks: Bookmark[]) => void
): () => void {
  let channel: ReturnType<typeof supabase.channel> | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let isSubscribed = false;

  const setupSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('User must be authenticated to subscribe to bookmarks');
        return;
      }

      // Clean up existing channel if any
      if (channel) {
        await supabase.removeChannel(channel);
      }

      // Create a new channel - listen to all bookmark changes
      // RLS policies ensure we only get our own bookmarks when we fetch
      channel = supabase
        .channel('bookmarks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks'
          },
          async (payload) => {
            console.log('🔔 Received bookmark change:', payload.eventType, payload);
            // Fetch updated bookmarks whenever any change occurs
            // RLS will filter to only this user's bookmarks
            try {
              const bookmarks = await getBookmarks();
              console.log('✅ Fetched bookmarks after change:', bookmarks.length);
              callback(bookmarks);
            } catch (error) {
              console.error('❌ Failed to fetch bookmarks after change:', error);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isSubscribed = true;
            console.log('Successfully subscribed to bookmark changes');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            isSubscribed = false;
            console.log('Subscription closed or error, attempting reconnection...');

            // Implement automatic reconnection with exponential backoff
            if (reconnectTimeout) {
              clearTimeout(reconnectTimeout);
            }
            reconnectTimeout = setTimeout(() => {
              setupSubscription();
            }, 3000); // Retry after 3 seconds
          }
        });
    } catch (error) {
      console.error('Failed to setup bookmark subscription:', error);

      // Retry connection after error
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      reconnectTimeout = setTimeout(() => {
        setupSubscription();
      }, 5000); // Retry after 5 seconds on error
    }
  };

  // Initialize subscription
  setupSubscription();

  // Return unsubscribe function
  return () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    if (channel) {
      supabase.removeChannel(channel);
    }
    isSubscribed = false;
  };
}

