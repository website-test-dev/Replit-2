import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";

interface Announcement {
  id: number;
  text: string;
  link?: string;
  bgColor: string;
  textColor: string;
}

const announcements: Announcement[] = [
  {
    id: 1,
    text: "Free Shipping on Orders Above ₹999 | Limited Time Offer",
    link: "/shipping-policy",
    bgColor: "bg-primary",
    textColor: "text-white"
  },
  {
    id: 2,
    text: "New Collection Drops Every Friday | Join the Waitlist",
    link: "/new-arrivals",
    bgColor: "bg-black",
    textColor: "text-white"
  },
  {
    id: 3,
    text: "Use Code WELCOME10 for 10% Off Your First Order",
    link: "/products",
    bgColor: "bg-secondary",
    textColor: "text-white"
  }
];

const AnnouncementBanner = () => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [closed, setClosed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation when component mounts
    setIsAnimating(true);

    // Rotate through announcements
    const interval = setInterval(() => {
      setIsAnimating(false);
      
      setTimeout(() => {
        setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
        setIsAnimating(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (closed) return null;

  const announcement = announcements[currentAnnouncement];

  return (
    <div 
      className={`w-full ${announcement.bgColor} ${announcement.textColor} py-2 relative`}
    >
      <div 
        className={`container mx-auto px-4 flex justify-center items-center text-center text-sm transition-opacity duration-300 ease-in-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
      >
        {announcement.link ? (
          <Link 
            href={announcement.link} 
            className="font-medium hover:underline transition-all duration-200 tracking-wide"
          >
            {announcement.text}
          </Link>
        ) : (
          <p className="font-medium tracking-wide">{announcement.text}</p>
        )}
        
        <button
          onClick={() => setClosed(true)}
          className="absolute right-4 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
          aria-label="Close announcement"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;