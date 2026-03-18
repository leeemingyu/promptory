import Link from "next/link";

interface SavedPrompt {
  id: string;
}

const SAVED_PROMPTS: SavedPrompt[] = [{ id: "1" }, { id: "2" }, { id: "3" }];

export default function SavedPage() {
  return (
    <main>
      <h1>저장한 프롬프트</h1>
      <div className="mt-4 space-y-2">
        {SAVED_PROMPTS.map((prompt) => (
          <div key={prompt.id}>
            <Link href={`/prompts/${prompt.id}`} target="_blank">
              go to prompt {prompt.id}
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
