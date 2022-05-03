import { configureBlog, handler } from "./blog.tsx";
import {
  assert,
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.137.0/testing/asserts.ts";

const BLOG_URL = new URL("./testdata/main.js", import.meta.url);
const SETTINGS = {
  title: "Test blog",
  subtitle: "This is some subtitle",
  header: "This is some header",
  style: `body { background-color: #f0f0f0; }`,
};
const BLOG_SETTINGS = await configureBlog(false, BLOG_URL.href, SETTINGS);

Deno.test("index page", async () => {
  const resp = await handler(
    new Request("https://blog.deno.dev"),
    BLOG_SETTINGS,
  );
  assert(resp);
  assertEquals(resp.status, 200);
  assertEquals(resp.headers.get("content-type"), "text/html");
  const body = await resp.text();
  assertStringIncludes(body, `<html lang="en">`);
  assertStringIncludes(body, `Test blog`);
  assertStringIncludes(body, `This is some subtitle`);
  assertStringIncludes(body, `This is some header`);
  assertStringIncludes(body, `href="/first"`);
  assertStringIncludes(body, `href="/second"`);
});

Deno.test("posts/ first", async () => {
  const resp = await handler(
    new Request("https://blog.deno.dev/first"),
    BLOG_SETTINGS,
  );
  assert(resp);
  assertEquals(resp.status, 200);
  assertEquals(resp.headers.get("content-type"), "text/html");
  const body = await resp.text();
  assertStringIncludes(body, `<html lang="en">`);
  assertStringIncludes(body, `First post`);
  assertStringIncludes(body, `2022-03-20`);
  assertStringIncludes(body, `<img src="first/hello.png" />`);
  assertStringIncludes(body, `<p>Lorem Ipsum is simply dummy text`);
});

Deno.test("posts/ second", async () => {
  const resp = await handler(
    new Request("https://blog.deno.dev/second"),
    BLOG_SETTINGS,
  );
  assert(resp);
  assertEquals(resp.status, 200);
  assertEquals(resp.headers.get("content-type"), "text/html");
  const body = await resp.text();
  assertStringIncludes(body, `<html lang="en">`);
  assertStringIncludes(body, `Second post`);
  assertStringIncludes(body, `2022-05-02`);
  assertStringIncludes(body, `<img src="second/hello2.png" />`);
  assertStringIncludes(body, `<p>Lorem Ipsum is simply dummy text`);
});

Deno.test("static files in posts/ directory", async () => {
  {
    const resp = await handler(
      new Request("https://blog.deno.dev/first/hello.png"),
      BLOG_SETTINGS,
    );
    assert(resp);
    assertEquals(resp.status, 200);
    assertEquals(resp.headers.get("content-type"), "image/png");
    await resp.arrayBuffer();
  }
  {
    const resp = await handler(
      new Request("https://blog.deno.dev/second/hello2.png"),
      BLOG_SETTINGS,
    );
    assert(resp);
    assertEquals(resp.status, 200);
    assertEquals(resp.headers.get("content-type"), "image/png");
    await resp.arrayBuffer();
  }
});

Deno.test("static files in root directory", async () => {
  const resp = await handler(
    new Request("https://blog.deno.dev/cat.png"),
    BLOG_SETTINGS,
  );
  assert(resp);
  assertEquals(resp.status, 200);
  assertEquals(resp.headers.get("content-type"), "image/png");
  await resp.arrayBuffer();
});
