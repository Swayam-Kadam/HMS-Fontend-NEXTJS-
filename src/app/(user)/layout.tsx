import UserHeader from '@/layout/UserHeader';
import UserFooter from '@/layout/UserFooter';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserHeader />
      <main className="min-h-screen bg-gray-50">{children}</main>
      <UserFooter />
      <ChatbotWidget />
    </>
  );
}
