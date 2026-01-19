import Link from "next/link";

const page = () => {
  return (
    <div>
      저장된 프롬프트
      <div>
        <Link href="/prompt/1" target="_blank">
          go to prompt 1
        </Link>
      </div>
      <div>
        <Link href="/prompt/2" target="_blank">
          go to prompt 2
        </Link>
      </div>
      <div>
        <Link href="/prompt/3" target="_blank">
          go to prompt 3
        </Link>
      </div>
    </div>
  );
};

export default page;
