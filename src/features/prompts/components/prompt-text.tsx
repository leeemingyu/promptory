type PromptTextProps = {
  text: string;
};

export default function PromptText({ text }: PromptTextProps) {
  return (
    <div className="max-h-20 overflow-y-auto whitespace-pre-wrap leading-relaxed text-gray-800">
      {text}
    </div>
  );
}
