// Forum System Types

export type ForumCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  parentId: number | null;
  sortOrder: number;
  isLocked: boolean;
  isHidden: boolean;
  threadCount: number;
  postCount: number;
  lastThreadId: number | null;
  lastPostAt: string | null;
  createdAt: string;
  updatedAt: string;
  children?: ForumCategory[];
};

export type ForumThread = {
  id: number;
  categoryId: number;
  authorId: number;
  title: string;
  slug: string;
  content: string;
  contentHtml: string | null;
  isPinned: boolean;
  isLocked: boolean;
  isHidden: boolean;
  isAnnouncement: boolean;
  viewCount: number;
  replyCount: number;
  likeCount: number;
  lastPostId: number | null;
  lastPostAt: string | null;
  lastPostBy: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Joined data
  author?: ForumUser;
  category?: ForumCategory;
};

export type ForumPost = {
  id: number;
  threadId: number;
  authorId: number;
  parentId: number | null;
  content: string;
  contentHtml: string | null;
  isSolution: boolean;
  isHidden: boolean;
  likeCount: number;
  editCount: number;
  editedAt: string | null;
  editedBy: number | null;
  createdAt: string;
  updatedAt: string;
  // Joined data
  author?: ForumUser;
  replies?: ForumPost[];
};

export type ReactionType = 'like' | 'love' | 'helpful' | 'insightful' | 'funny';

export type ForumReaction = {
  id: number;
  userId: number;
  threadId: number | null;
  postId: number | null;
  reactionType: ReactionType;
  createdAt: string;
};

export type ForumSubscription = {
  id: number;
  userId: number;
  threadId: number | null;
  categoryId: number | null;
  notifyEmail: boolean;
  notifyPush: boolean;
  createdAt: string;
};

export type NotificationType = 'reply' | 'mention' | 'reaction' | 'solution' | 'announcement';

export type ForumNotification = {
  id: number;
  userId: number;
  type: NotificationType;
  threadId: number | null;
  postId: number | null;
  actorId: number | null;
  message: string | null;
  isRead: boolean;
  createdAt: string;
  // Joined data
  actor?: ForumUser;
  thread?: ForumThread;
};

export type ForumUserStats = {
  userId: number;
  threadCount: number;
  postCount: number;
  reactionReceived: number;
  reactionGiven: number;
  solutionsCount: number;
  reputation: number;
  rankName: string;
  lastActivityAt: string | null;
};

export type ForumUser = {
  id: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  role: 'admin' | 'moderator' | 'user';
  stats?: ForumUserStats;
};

export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export type ForumReport = {
  id: number;
  reporterId: number;
  targetType: 'thread' | 'post' | 'user';
  targetId: number;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  reviewedBy: number | null;
  reviewedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
};

export type ModerationAction =
  | 'hide_thread'
  | 'show_thread'
  | 'lock_thread'
  | 'unlock_thread'
  | 'pin_thread'
  | 'unpin_thread'
  | 'hide_post'
  | 'show_post'
  | 'delete_thread'
  | 'delete_post'
  | 'warn_user'
  | 'ban_user';

export type ForumModerationLog = {
  id: number;
  moderatorId: number;
  action: ModerationAction;
  targetType: 'thread' | 'post' | 'user' | 'category';
  targetId: number;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type ForumBookmark = {
  id: number;
  userId: number;
  threadId: number | null;
  postId: number | null;
  note: string | null;
  createdAt: string;
};

// API Response types
export type ForumCategoriesResponse = {
  items: ForumCategory[];
};

export type ForumThreadsResponse = {
  items: ForumThread[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export type ForumPostsResponse = {
  items: ForumPost[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export type ForumNotificationsResponse = {
  items: ForumNotification[];
  unreadCount: number;
};

// Create/Update types
export type CreateCategoryInput = {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: number;
  sortOrder?: number;
};

export type CreateThreadInput = {
  categoryId: number;
  title: string;
  content: string;
  tags?: string[];
};

export type CreatePostInput = {
  threadId: number;
  content: string;
  parentId?: number;
};

export type UpdateThreadInput = {
  title?: string;
  content?: string;
  tags?: string[];
};

export type UpdatePostInput = {
  content: string;
};

export type CreateReportInput = {
  targetType: 'thread' | 'post' | 'user';
  targetId: number;
  reason: ReportReason;
  description?: string;
};

// Search types
export type ForumSearchParams = {
  query: string;
  categoryId?: number;
  authorId?: number;
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'views' | 'replies';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

export type ForumSearchResult = {
  threads: ForumThread[];
  posts: ForumPost[];
  total: number;
};

// User rank definitions
export const USER_RANKS = [
  { name: 'Yeni Üye', minReputation: 0, color: 'gray' },
  { name: 'Aktif Üye', minReputation: 50, color: 'blue' },
  { name: 'Katkı Sağlayan', minReputation: 150, color: 'green' },
  { name: 'Uzman', minReputation: 500, color: 'purple' },
  { name: 'Usta', minReputation: 1000, color: 'gold' },
  { name: 'Efsane', minReputation: 2500, color: 'diamond' },
] as const;

export function getUserRank(reputation: number): typeof USER_RANKS[number] {
  for (let i = USER_RANKS.length - 1; i >= 0; i--) {
    if (reputation >= USER_RANKS[i].minReputation) {
      return USER_RANKS[i];
    }
  }
  return USER_RANKS[0];
}

// Reputation points config
export const REPUTATION_POINTS = {
  createThread: 5,
  createPost: 2,
  receiveLike: 3,
  receiveHelpful: 5,
  postMarkedSolution: 10,
  giveReaction: 1,
} as const;
