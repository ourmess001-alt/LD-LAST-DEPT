import { ShowroomClient } from '@/components/showroom/ShowroomClient';

export default function HomePage() {
  return (
    <main className="w-full min-h-screen">
      <h1 className="sr-only">AeroStudio 3D Sneaker Showroom</h1>
      <ShowroomClient />
    </main>
  );
}
