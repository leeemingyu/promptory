export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      <h1>프롬프트 상세 페이지</h1>
      <p>ID: {id}</p>
    </main>
  );
}
