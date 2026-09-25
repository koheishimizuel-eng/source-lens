import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import type { Document } from "../data/documents"; // ←そのままの場合

// コマンドライン引数からURLと組織名を取得
const targetUrl = process.argv[2];
const organizationInput = process.argv[3] || "不明";

if (!targetUrl) {
  console.error("エラー: URLを指定してください。");
  console.log("使用例: npx tsx scripts/fetch-document.ts <URL> [組織名]");
  process.exit(1);
}

async function addDocumentAutomatically() {
  try {
    console.log(`[1/3] ページを取得中: ${targetUrl}`);
    const response = await globalThis.fetch(targetUrl);
    const htmlText = await response.text();

    // HTMLを解析
    const dom = new JSDOM(htmlText);
    const doc = dom.window.document;

    // タイトルの自動抽出 (og:title または <title>)
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");
    const rawTitle = ogTitle || doc.querySelector("title")?.textContent || "タイトル不明";
    const title = rawTitle.replace(/\|.*/, "").replace(/-.*/, "").trim();

    // 概要の自動抽出 (og:description または meta description)
    const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content");
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute("content");
    const description = ogDesc || metaDesc || `${organizationInput}の公式サイトで公開された資料です。`;

    // 本日の日付を取得
    const today = new Date();
    const publishedAt = today.toISOString().split("T")[0];
    const date = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

    // 追加する新データオブジェクト
    const newDoc: Document = {
      title,
      organization: organizationInput,
      date,
      publishedAt,
      type: "公式資料",
      description,
      primarySourceReason: `${organizationInput}の公式サイトで直接公開されている原典資料です。`,
      url: targetUrl,
    };

    console.log("[2/3] 自動抽出し作成されたデータ:");
    console.log(newDoc);

    // data/documents.ts ファイルを読み込み＆更新
    const filePath = path.join(process.cwd(), "data", "documents.ts");
    let fileContent = fs.readFileSync(filePath, "utf-8");

    // Arrayの末尾 (];) の直前に新データを注入
    const insertPosition = fileContent.lastIndexOf("];");
    if (insertPosition === -1) {
      throw new Error("data/documents.ts の構造が想定と異なります。");
    }

    const formattedData = `  {\n` +
      `    title: ${JSON.stringify(newDoc.title)},\n` +
      `    organization: ${JSON.stringify(newDoc.organization)},\n` +
      `    date: ${JSON.stringify(newDoc.date)},\n` +
      `    publishedAt: ${JSON.stringify(newDoc.publishedAt)},\n` +
      `    type: ${JSON.stringify(newDoc.type)},\n` +
      `    description: ${JSON.stringify(newDoc.description)},\n` +
      `    primarySourceReason: ${JSON.stringify(newDoc.primarySourceReason)},\n` +
      `    url: ${JSON.stringify(newDoc.url)},\n` +
      `  },\n`;

    const updatedContent =
      fileContent.slice(0, insertPosition) +
      formattedData +
      fileContent.slice(insertPosition);

    fs.writeFileSync(filePath, updatedContent, "utf-8");
    console.log("[3/3] data/documents.ts への自動追加が完了しました！");

  } catch (error) {
    console.error("データの追加に失敗しました:", error);
  }
}

addDocumentAutomatically();
