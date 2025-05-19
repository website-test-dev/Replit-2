import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, StarHalf } from "lucide-react";

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
}

const CustomerReviews = () => {
  const reviews: Review[] = [
    {
      id: 1,
      name: "Priya Sharma",
      location: "Delhi",
      rating: 5,
      text: "I love the quick delivery and the quality of clothes! The app is so easy to use and the tracking feature is amazing.",
    },
    {
      id: 2,
      name: "Rahul Kumar",
      location: "Mumbai",
      rating: 4.5,
      text: "The fashion collection is always up-to-date and the same day delivery option has saved me many times! Highly recommend.",
    },
    {
      id: 3,
      name: "Ananya Trivedi",
      location: "Bangalore",
      rating: 5,
      text: "Their return policy is so convenient, and customer service is always helpful. The app notifications keep me updated about my delivery.",
    },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-warning text-warning" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-warning text-warning" />);
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" />);
    }

    return stars;
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-poppins font-bold text-3xl mb-10 text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-gray-50">
              <CardContent className="p-6">
                <div className="flex text-warning mb-4">
                  {renderStars(review.rating)}
                </div>
                <p className="mb-6 text-muted-foreground">"{review.text}"</p>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarFallback className="bg-gray-300 text-gray-600">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{review.name}</h4>
                    <p className="text-muted-foreground text-sm">{review.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
