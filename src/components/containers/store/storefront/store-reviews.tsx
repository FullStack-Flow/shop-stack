import { Star, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { StoreReview } from '@/types/store-types';

interface StoreReviewsProps {
  rating: number;
  reviewCount: number;
}

// Mock reviews data
const mockReviews: StoreReview[] = [
  {
    id: '1',
    storeId: '1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    comment:
      'Excellent store! Fast shipping and great quality products. Will definitely shop here again.',
    date: '2024-01-15',
    helpful: 12,
  },
  {
    id: '2',
    storeId: '1',
    userName: 'Michael Chen',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    rating: 4,
    comment:
      'Good selection of products and reasonable prices. Customer service was helpful.',
    date: '2024-01-10',
    helpful: 8,
  },
  {
    id: '3',
    storeId: '1',
    userName: 'Emily Rodriguez',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    comment:
      'Amazing experience! The products are exactly as described and arrived quickly.',
    date: '2024-01-05',
    helpful: 15,
  },
  {
    id: '4',
    storeId: '1',
    userName: 'David Kim',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    rating: 3,
    comment:
      'Products are good but shipping took longer than expected. Otherwise satisfied.',
    date: '2023-12-28',
    helpful: 5,
  },
];

export function StoreReviews({ rating, reviewCount }: StoreReviewsProps) {
  const [reviews] = useState<StoreReview[]>(mockReviews);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid @2xl:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center space-y-2 border-muted @2xl:border-r p-6">
              <div className="font-bold text-5xl">{rating.toFixed(1)}</div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${
                      i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm">
                Based on {reviewCount} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex w-12 items-center gap-1">
                    <span className="text-sm">{star}</span>
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={percentage} className="h-2 flex-1" />
                  <span className="w-12 text-muted-foreground text-sm">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Customer Reviews</h3>

        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={review.userAvatar}
                      alt={review.userName}
                    />
                    <AvatarFallback>
                      {review.userName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Review Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{review.userName}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`size-3.5 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {new Date(review.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {review.comment}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <ThumbsUp className="size-3.5" />
                        <span className="text-xs">
                          Helpful ({review.helpful})
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
