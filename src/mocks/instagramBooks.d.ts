// Type definitions for Instagram-like Book Feed mock data

declare module './instagramBooks' {
  export interface MockUser {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    profilePicURL: string;
    location: string;
    stats: {
      totalBooks: number;
      booksRead: number;
      booksReading: number;
      booksToRead: number;
      totalPages: number;
      pagesRead: number;
      averageRating: number;
      reviewsWritten: number;
      followersCount: number;
      followingCount: number;
      streakDays: number;
      lastActive: string;
    };
  }

  export interface MockBook {
    id: string;
    title: string;
    authors: string[];
    publisher: string;
    publishedDate: string;
    description: string;
    pageCount: number;
    categories: string[];
    thumbnail: string;
    image: string;
    isbn: string;
    language: string;
    averageRating: number;
    ratingsCount: number;
    reviewsCount: number;
    shelvesCount: {
      wantToRead: number;
      currentlyReading: number;
      read: number;
    };
    trendingScore: number;
  }

  export interface MockReview {
    id: string;
    bookId: string;
    userId: string;
    username: string;
    userProfilePic: string;
    rating: number;
    title: string;
    content: string;
    spoilerWarning: boolean;
    tags: string[];
    likes: string[];
    likesCount: number;
    commentsCount: number;
    readingStatus: string;
    progress: number;
    createdAt: string;
    updatedAt: string;
  }

  export interface InstagramFeedPost {
    id: string;
    type: string;
    user: {
      id: string;
      username: string;
      displayName: string;
      profilePicURL: string;
      stats: {
        followersCount: number;
        followingCount: number;
      };
    };
    book: {
      id: string;
      title: string;
      authors: string[];
      thumbnail: string;
      image: string;
      pageCount: number;
      averageRating: number;
    };
    review: {
      rating: number;
      title: string;
      content: string;
      excerpt: string;
      tags: string[];
      likesCount: number;
      commentsCount: number;
      readingStatus: string;
      progress: number;
    };
    interactions: {
      isLiked: boolean;
      isSaved: boolean;
      likes: string[];
      comments: any[];
    };
    timestamp: string;
    timeAgo: string;
  }

  export const mockUsers: MockUser[];
  export const mockBooks: MockBook[];
  export const mockReviews: MockReview[];
  export const mockActivities: any[];
  export const getInstagramFeedPosts: () => InstagramFeedPost[];
}