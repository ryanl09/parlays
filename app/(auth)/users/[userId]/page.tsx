export default async function UserPage({ params }: { params: { userId: string } }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Profile</h2>
    </div>
  );
}