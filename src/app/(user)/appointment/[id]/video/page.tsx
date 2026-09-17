import VideoConsultationContent from '@/components/video/VideoConsultationContent';
import { buildPageMetadata } from '@/lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Video Consultation',
  description: 'Join your secure video consultation with Apollo Hospital.',
  path: '/appointment/video',
  private: true,
});

interface VideoConsultationPageProps {
  params: Promise<{ id: string }>;
}

const VideoConsultationPage = async ({ params }: VideoConsultationPageProps) => {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <VideoConsultationContent appointmentId={id} />
    </div>
  );
};

export default VideoConsultationPage;
