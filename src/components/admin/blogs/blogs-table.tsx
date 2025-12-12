import type { Blog } from "@/types/blog";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

type Props = {
  blogs: Blog[];
};

export default function BlogsTable({ blogs }: Props) {
  if (blogs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.6)]/60 p-10 text-center text-sm text-[rgba(255,255,255,0.55)]">
        Henüz blog içeriği bulunmuyor. Yeni bir yazı ile başlayın.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.55)]/80 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <table className="min-w-full divide-y divide-[rgba(110,211,225,0.15)]">
        <thead className="bg-[rgba(8,24,32,0.9)] text-[rgba(255,255,255,0.75)]">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em]">
              Başlık
            </th>
            <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em]">
              Yazar
            </th>
            <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em]">
              Son Güncelleme
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(110,211,225,0.08)] text-sm text-[rgba(255,255,255,0.8)]">
          {blogs.map((blog) => (
            <tr key={blog.id} className="hover:bg-[rgba(8,32,42,0.55)]">
              <td className="px-6 py-4">
                <p className="font-semibold text-white">{blog.title}</p>
                <p className="mt-1 text-xs text-[rgba(255,255,255,0.55)]">{blog.excerpt}</p>
              </td>
              <td className="px-6 py-4 text-[rgba(255,255,255,0.75)]">{blog.author}</td>
              <td className="px-6 py-4 text-[rgba(255,255,255,0.65)]">
                {formatDateTime(blog.updatedAt ?? blog.date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
