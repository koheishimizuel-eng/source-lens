import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

// 自動取得対象のサイト一覧
const TARGET_SOURCES = [
  {
    agency: "デジタル庁",
    url: "https://www.digital.go.jp/news/",
    type: "公式資料",
    reason: "デジタル庁の公式サイトで直接公開されている原典資料です。",
  },
  {
    agency: "総務省",
    url: "https://www.soumu.go.jp/menu_news/s-news/index.html",
    type: "公式資料",
    reason: "総務省の公式サイトで直接公開されている原典資料です。",
  },
];

interface DocumentItem {
  title: string;
  url: string;
  organization: string;
  type: string;
  description: string;
  primarySourceReason: string;
  publishedAt: string;
}

// 今日の日付 (YYYY-MM-DD)
const todayStr = new Date().toISOString().split("T")[0];

async function fetchAndDecode(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  const contentType = response.headers.get("content-type") || "";

  // Shift_JIS / SJIS の判定
  if (
    contentType.includes("shift_jis") ||
    contentType.includes("sjis") ||
    url.includes("soumu.go.jp")
  ) {
    const decoder = new TextDecoder("shift-jis");
    return decoder.decode(arrayBuffer);
  }

  // デフォルトは UTF-8
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(arrayBuffer);
}

async function runAutoFetch() {
  console.log("自動収集スクリプトを開始します...");

  const dataPath = path.join(process.cwd(), "data", "document.ts");
  
  // 既存データの読み込み処理（簡易チェック）
  let existingDocuments: DocumentItem[] = [];
  if (fs.existsSync(dataPath)) {
    const content = fs.readFileSync(dataPath, "utf-8");
    // URLの重複を防ぐための簡易リストを作成
  }

  const newItems: DocumentItem[] = [];

  for (const source of TARGET_SOURCES) {
    try {
      console.log(`取得中: ${source.agency} (${source.url})`);
      const htmlText = await fetchAndDecode(source.url);
      const dom = new JSDOM(htmlText);
      const document = dom.window.document;

      // og:title または <title> タグを取得
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
      const pageTitle = document.querySelector("title")?.textContent;
      const rawTitle = ogTitle || pageTitle || `${source.agency} 最新発表情報`;
      const title = rawTitle.replace(/\r?\n/g, "").trim();

      // og:description または メタdescription を取得
      const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute("content");
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content");
      const description = (ogDesc || metaDesc || `${source.agency}の公式サイトで公開された資料です。`).trim();

      newItems.push({
        title,
        url: source.url,
        organization: source.agency,
        type: source.type,
        description,
        primarySourceReason: source.reason,
        publishedAt: todayStr,
      });
    } catch (error) {
      console.error(`${source.agency} の取得中にエラーが発生しました:`, error);
    }
  }

  if (newItems.length === 0) {
    console.log("新しいデータはありませんでした。");
    return;
  }

  // 元から存在する固定サンプルデータ（必要に応じて維持）
  const initialData: DocumentItem[] = [
    {
      title: "「行政の進化と革新のための生成AIの調達・利活用に係るガイドライン（第2.0版）」を策定しました",
      url: "https://www.digital.go.jp/news/7b1899a7-96a1-4322-83b3-82a849202a0a",
      organization: "デジタル庁",
      type: "公式発表",
      description: "デジタル庁が、行政における生成AIの調達・利活用に関するガイドライン第2.0版の策定を公表した資料です。",
      primarySourceReason: "デジタル庁が公式サイトで直接公開した、同庁による公式発表です。",
      publishedAt: "2024-06-12",
    },
    {
      title: "「AI事業者ガイドライン（第1.0版）」を取りまとめました",
      url: "https://www.meti.go.jp/press/2024/04/20240419004/20240419004.html",
      organization: "総務省・経済産業省",
      type: "公式発表",
      description: "総務省と経済産業省が、生成AIの普及などを踏まえて既存のガイドラインを統合・更新し、AI事業者向けガイドラインを公表した資料です。",
      primarySourceReason: "経済産業省が、総務省との共同取りまとめとして公式サイトで直接公開した発表です。",
      publishedAt: "2024-04-19",
    },
    {
      title: "AIと著作権に関する考え方について",
      url: "https://www.bunka.go.jp/seisaku/bunkashingikai/chosakuken/hoseido/r05_kiso/",
      organization: "文化庁",
      type: "公式資料",
      description: "文化審議会著作権分科会の法制度小委員会が、生成AIと著作権の関係について取りまとめた考え方を紹介する文化庁の資料です。",
      primarySourceReason: "文化庁が公式サイトで公開し、同庁の審議会で取りまとめられた資料です。",
      publishedAt: "2024-03-15",
    },
  ];

  // 全データを結合（新規取得データを上に配置）
  const allDocuments = [...newItems, ...initialData];

  // TypeScript ファイルとして書き出し
  const fileContent = `export const documents = ${JSON.stringify(allDocuments, null, 2)};\n`;
  fs.writeFileSync(dataPath, fileContent, "utf-8");

  console.log(`成功: ${dataPath} に ${allDocuments.length} 件のデータを保存しました！`);
}

runAutoFetch();