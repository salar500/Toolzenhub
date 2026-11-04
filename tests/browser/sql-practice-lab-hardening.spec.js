/**
 * SQL Practice Lab: isolation and resource limits of the worker, in a real browser.
 * Every run must start from a brand-new database and nothing a visitor runs may outlive it; a statement that makes a huge
 * result must neither hang nor crash the page.
 */
import { test, expect } from "../helpers/test-base.mjs";
import { openLab } from "../helpers/lab-contract.mjs";

const ROUTE = "tools/sql-practice-lab/";

async function sandbox(page, sql, wait = 20000) {
  await page.locator("#sql-sandbox-input").fill(sql);
  await page.locator("#sql-sandbox-run").click();
  await expect(page.locator("#sql-sandbox-out")).not.toHaveText("Running...", { timeout: wait });
  return page.locator("#sql-sandbox-out");
}

test.describe("SQL Practice Lab: isolation and limits", () => {
  test("files written by ATTACH or VACUUM INTO do not survive into the next run", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    // sql.js allows ATTACH and VACUUM INTO, but only on the worker's own in-memory file system: what matters is that nothing survives into the next run
    await sandbox(page, "ATTACH DATABASE 'leak.db' AS x; CREATE TABLE x.t(a); INSERT INTO x.t VALUES (42);");
    const second = await sandbox(page, "ATTACH DATABASE 'leak.db' AS x; SELECT a FROM x.t;");
    await expect(second).not.toContainText("42");
    await sandbox(page, "VACUUM INTO 'copy.db';");
    const third = await sandbox(page, "ATTACH DATABASE 'copy.db' AS y; SELECT name FROM y.sqlite_master;");
    await expect(third).not.toContainText("customers");
    // the lab itself still works afterwards, with the original data
    const again = await sandbox(page, "SELECT COUNT(*) AS n FROM customers");
    await expect(again.locator("td")).toHaveText("12");
  });

  test("a statement that makes millions of rows is stopped or cut, shows at most the row limit and leaves the page usable", async ({ page, go }) => {
    test.setTimeout(120000);
    await openLab(page, go, ROUTE);
    const out = await sandbox(page, "WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c WHERE x<5000000) SELECT x FROM c;", 60000);
    await expect(out).toContainText(/longer than 3 seconds|rows|more/i);
    expect(await out.locator("tbody tr").count()).toBeLessThanOrEqual(200);
    const again = await sandbox(page, "SELECT COUNT(*) AS n FROM customers", 30000);
    await expect(again.locator("td")).toHaveText("12");
  });
});
