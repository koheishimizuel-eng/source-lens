import { execSync } from "child_process";

// 自動収集したい対象ページと組織のリスト
const targetSources = [
  {
    url: "https://www.digital.go.jp/news/decb64eb-f26e-41cb-8d37-f3dd173108b8",
    organization: "デジタル庁",
  },
  {
    url: "https://www.soumu.go.jp/main_sosiki/kenkyu/ai_governance/index.html",
    organization: "総務省",
  },
  // 今後増やしたいURLをここに追加するだけでOK
];

async function runAutoFetchAll() {
  console.log("=== 自動収集処理を開始します ===");

  for (const source of targetSources) {
    try {
      console.log(`\n-----------------------------------`);
      console.log(`取得開始: ${source.organization} (${source.url})`);
      
      // 先ほど作成した単体取得スクリプトを順番に実行
      execSync(`npx tsx scripts/fetch-document.ts "${source.url}" "${source.organization}"`, {
        stdio: "inherit",
      });
    } catch (error) {
      console.error(`エラー発生 (${source.organization}):`, error);
    }
  }

  console.log("\n=== 全ページの処理が完了しました ===");
}

runAutoFetchAll();