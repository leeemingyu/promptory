import type { UserRankingRow } from "@/features/rankings/types/user-ranking";
import { CircleUser } from "lucide-react";
import Link from "next/link";

type UserRankingTableProps = {
  rows: UserRankingRow[];
};

export default function UserRankingTable({ rows }: UserRankingTableProps) {
  const nf = new Intl.NumberFormat("ko-KR");

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900">사용자 랭킹</h2>
        <p className="mt-1 text-sm text-gray-500">
          랭킹은 매시간 정각에 바뀌어요. 좋아요 수와 서비스 기여도를 종합해서
          순위를 결정해요. 매시간 정각, 새롭게 업데이트되는 랭킹을 확인해 보세요.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-gray-500">
          아직 랭킹을 표시할 데이터가 없습니다.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-6 py-3">순위</th>
                <th className="px-6 py-3">닉네임</th>
                <th className="px-6 py-3">받은 좋아요</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.rank}-${row.userId ?? row.nickname}`}
                  className="border-t border-gray-100"
                >
                  <td className="px-6 py-3 font-semibold text-gray-900">
                    {row.rank}
                  </td>
                  <td className="px-6 py-3">
                    {row.userId ? (
                      <Link
                        href={`/profiles/${row.userId}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        {row.profileImageUrl ? (
                          // Use <img> to avoid Next Image host restrictions.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.profileImageUrl}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <CircleUser
                            className="h-8 w-8 text-gray-400"
                            aria-hidden="true"
                          />
                        )}
                        <span className="font-medium text-gray-900">
                          {row.nickname}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3">
                        {row.profileImageUrl ? (
                          // Use <img> to avoid Next Image host restrictions.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.profileImageUrl}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <CircleUser
                            className="h-8 w-8 text-gray-400"
                            aria-hidden="true"
                          />
                        )}
                        <span className="font-medium text-gray-900">
                          {row.nickname}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3">{nf.format(row.totalLikes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
