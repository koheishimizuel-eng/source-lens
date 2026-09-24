"use client";

import { type FormEvent, useState } from "react";

const documents = [
  {
    title: "生成AIの利用に関する政府方針",
    organization: "デジタル庁",
    date: "2025年5月30日",
    publishedAt: "2025-05-30",
  
    type: "公式発表",
    description:
      "行政機関における生成AIの活用方針と、安全な利用のための基本的な考え方をまとめた資料です。",
    primarySourceReason:
      "デジタル庁が公式に公開した行政機関向けの方針資料です。",
    url: "https://www.digital.go.jp/",
  },
  {
    title: "AI戦略に関する検討会資料",
    organization: "総務省",
    date: "2025年4月18日",
    publishedAt: "2025-04-18",
    type: "会議資料",
    description:
      "AI技術の社会実装と、情報通信分野における今後の施策を扱う公式資料です。",
    primarySourceReason:
      "総務省が開催した検討会で公開された公式の会議資料です。",
    url: "https://www.soumu.go.jp/",
  },
  {
    title: "生成AIの活用と著作権に関する整理",
    organization: "文化庁",
    date: "2025年3月12日",
    publishedAt: "2025-03-12",
    type: "公的資料",
    description:
      "生成AIを利用する際に検討すべき著作権上の論点を整理した資料です。",
    primarySourceReason:
      "文化庁が公式に公開した著作権に関する公的資料です。",
    url: "https://www.bunka.go.jp/",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
const [selectedOrganization, setSelectedOrganization] = useState("すべて");
const [sortOrder, setSortOrder] = useState("newest");  
function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSearched(true);
  }
  

const filteredDocuments = documents.filter((document) => {
  const searchableText =
    `${document.title} ${document.organization} ${document.type} ${document.description}`.toLowerCase();

  const matchesQuery = searchableText.includes(query.trim().toLowerCase());

  const matchesOrganization =
    selectedOrganization === "すべて" ||
    document.organization === selectedOrganization;

  return matchesQuery && matchesOrganization;
});
const sortedDocuments = [...filteredDocuments].sort((a, b) => {
  if (sortOrder === "newest") {
    return b.publishedAt.localeCompare(a.publishedAt);
  }

  return a.publishedAt.localeCompare(b.publishedAt);
});
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <section className="mx-auto max-w-3xl">
        <p className="mb-4 text-sm font-semibold tracking-widest text-blue-600">
          SOURCE LENS
        </p>


        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          一次情報だけを、
          <br />
          まっすぐ探す。
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          官公庁・公的機関が公開する情報に絞って検索できるサービスです。
          ニュース記事や転載を避け、信頼できる原典へ直接たどり着けます。
        </p>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
  現在はポートフォリオ用のサンプルデータを表示しています。
  次の開発で、公的機関が公開する実際の一次情報へ対応予定です。
</div>

        <form className="mt-10 flex gap-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-5 py-4 outline-none focus:border-blue-600"
            placeholder="例：生成AIに関する政府の方針"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <button
            type="submit"
            className="shrink-0 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700"
          >
            検索
          </button>
        </form>
       <div className="mt-4 grid gap-4 sm:grid-cols-2">
  <div>
    <label
      className="mb-2 block text-sm font-semibold text-slate-700"
      htmlFor="organization"
    >
      発行機関で絞り込む
    </label>

    <select
      id="organization"
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 outline-none focus:border-blue-600"
      value={selectedOrganization}
      onChange={(event) => setSelectedOrganization(event.target.value)}
    >
      <option value="すべて">すべての機関</option>
      <option value="デジタル庁">デジタル庁</option>
      <option value="総務省">総務省</option>
      <option value="文化庁">文化庁</option>
    </select>
  </div>

  <div>
    <label
      className="mb-2 block text-sm font-semibold text-slate-700"
      htmlFor="sort-order"
    >
      並び順
    </label>

    <select
      id="sort-order"
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 outline-none focus:border-blue-600"
      value={sortOrder}
      onChange={(event) => setSortOrder(event.target.value)}
    >
      <option value="newest">公開日が新しい順</option>
      <option value="oldest">公開日が古い順</option>
    </select>
  </div>
</div>
        {hasSearched && (
          <div className="mt-12">
            <p className="mb-5 text-sm font-medium text-slate-600">
              「{query || "すべて"}」の検索結果：{filteredDocuments.length}件
            </p>

            {filteredDocuments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
                条件に一致する一次情報は見つかりませんでした。
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDocuments.map((document) => (
                  <article
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    key={document.title}
                  >
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                        {document.organization}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                        {document.type}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-bold">{document.title}</h2>

                    <p className="mt-2 leading-7 text-slate-600">
                      {document.description}
                    </p>

                    <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
  <span className="font-semibold">一次情報の根拠：</span>
  {document.primarySourceReason}
</p>

                    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-500">{document.date}</span>

                      <a
                        className="font-semibold text-blue-600 hover:underline"
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        公式サイトを開く →
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
//一次情報の根拠：公的機関が公式に公開した資料