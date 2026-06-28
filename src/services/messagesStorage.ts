export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'New' | 'Read' | 'Replied';
}

export interface UserReview {
  id: string;
  userName: string;
  userEmail: string;
  title: string;
  message: string;
  stars: number;
  date: string;
  reply: string;
  replyStatus: 'Pending' | 'Replied';
}

const CONTACT_KEY = 'hospital-contact-messages';
const REVIEWS_KEY = 'hospital-user-reviews';

const seedContactMessages: ContactMessage[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '+1 234 567 890',
    subject: 'Appointment',
    message: 'I would like to schedule an appointment with a cardiologist next week. Please let me know available slots.',
    date: '18 Jun 2026',
    status: 'New',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 234 567 891',
    subject: 'General Inquiry',
    message: 'Can you provide information about your health insurance accepted plans?',
    date: '17 Jun 2026',
    status: 'Read',
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike.brown@example.com',
    phone: '+1 234 567 892',
    subject: 'Emergency',
    message: 'Need urgent information about emergency room wait times and procedures.',
    date: '16 Jun 2026',
    status: 'Replied',
  },
  {
    id: '4',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    phone: '+1 234 567 893',
    subject: 'Feedback',
    message: 'Excellent service during my last visit. The nursing staff was very helpful and professional.',
    date: '15 Jun 2026',
    status: 'Read',
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.kim@example.com',
    phone: '+1 234 567 894',
    subject: 'Others',
    message: 'I lost my prescription report from last month. How can I get a duplicate copy?',
    date: '14 Jun 2026',
    status: 'New',
  },
];

const seedReviews: UserReview[] = [
  {
    id: '1',
    userName: 'John Doe',
    userEmail: 'johndoe@example.com',
    title: 'Excellent Care',
    message: 'The staff was very professional and caring throughout my visit. I felt safe and well looked after.',
    stars: 5,
    date: '12 Jun 2026',
    reply: 'Thank you for your kind words. We are glad you had a positive experience at Apollo Hospital.',
    replyStatus: 'Replied',
  },
  {
    id: '2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    title: 'Great Doctors',
    message: 'Dr. Sarah Johnson explained everything clearly and made me feel comfortable during consultation.',
    stars: 5,
    date: '10 Jun 2026',
    reply: '',
    replyStatus: 'Pending',
  },
  {
    id: '3',
    userName: 'Mike Brown',
    userEmail: 'mike.brown@example.com',
    title: 'Clean Facility',
    message: 'The hospital was spotless and well maintained. Very impressed with the hygiene standards.',
    stars: 4,
    date: '08 Jun 2026',
    reply: 'Thank you! Our housekeeping team works hard to maintain the highest standards.',
    replyStatus: 'Replied',
  },
  {
    id: '4',
    userName: 'Lisa Anderson',
    userEmail: 'lisa@example.com',
    title: 'Quick Service',
    message: 'Appointment was on time and the process was smooth from registration to consultation.',
    stars: 4,
    date: '05 Jun 2026',
    reply: '',
    replyStatus: 'Pending',
  },
  {
    id: '5',
    userName: 'Swayam Kadam',
    userEmail: 'swayamkadam@gmail.com',
    title: 'Friendly Staff',
    message: 'Everyone from reception to nurses was warm, helpful, and genuinely cared about my wellbeing.',
    stars: 5,
    date: '02 Jun 2026',
    reply: '',
    replyStatus: 'Pending',
  },
];

const readStorage = <T>(key: string, seed: T[]): T[] => {
  if (typeof window === 'undefined') return seed;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(stored) as T[];
  } catch {
    return seed;
  }
};

const writeStorage = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const getContactMessages = (): ContactMessage[] =>
  readStorage(CONTACT_KEY, seedContactMessages);

export const addContactMessage = (message: Omit<ContactMessage, 'id' | 'date' | 'status'>) => {
  const messages = getContactMessages();
  const newMessage: ContactMessage = {
    ...message,
    id: Date.now().toString(),
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: 'New',
  };
  writeStorage(CONTACT_KEY, [newMessage, ...messages]);
  return newMessage;
};

export const updateContactMessageStatus = (id: string, status: ContactMessage['status']) => {
  const messages = getContactMessages().map((m) => (m.id === id ? { ...m, status } : m));
  writeStorage(CONTACT_KEY, messages);
  return messages;
};

export const getUserReviews = (): UserReview[] => readStorage(REVIEWS_KEY, seedReviews);

export const updateReviewReply = (id: string, reply: string) => {
  const reviews = getUserReviews().map((r) =>
    r.id === id ? { ...r, reply, replyStatus: 'Replied' as const } : r
  );
  writeStorage(REVIEWS_KEY, reviews);
  return reviews;
};

export const addUserReview = (review: Omit<UserReview, 'id' | 'date' | 'reply' | 'replyStatus'>) => {
  const reviews = getUserReviews();
  const newReview: UserReview = {
    ...review,
    id: Date.now().toString(),
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    reply: '',
    replyStatus: 'Pending',
  };
  writeStorage(REVIEWS_KEY, [newReview, ...reviews]);
  return newReview;
};
